
"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const body = document.body;
const header = document.querySelector(".header");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".navigation");
const navigationLinks = document.querySelectorAll(".navigation a");
const sections = document.querySelectorAll("main section[id]");
const revealElements = document.querySelectorAll(".reveal");
const mouseGlow = document.querySelector(".mouse-glow");
const currentYear = document.querySelector("#current-year");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

/* =========================================================
   CURRENT YEAR
========================================================= */

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

function updateHeader() {
    if (!header) {
        return;
    }

    header.classList.toggle(
        "header-scrolled",
        window.scrollY > 30
    );
}

window.addEventListener("scroll", updateHeader, {
    passive: true
});

updateHeader();

/* =========================================================
   MOBILE MENU
========================================================= */

function openMenu() {
    if (!menuButton || !navigation) {
        return;
    }

    navigation.classList.add("open");
    menuButton.classList.add("active");
    body.classList.add("menu-open");

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation");
}

function closeMenu() {
    if (!menuButton || !navigation) {
        return;
    }

    navigation.classList.remove("open");
    menuButton.classList.remove("active");
    body.classList.remove("menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
}

function toggleMenu() {
    if (!navigation) {
        return;
    }

    if (navigation.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }
}

if (menuButton) {
    menuButton.addEventListener("click", toggleMenu);
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 780) {
        closeMenu();
    }
});

/* =========================================================
   SCROLL REVEAL ANIMATIONS
========================================================= */

/*
   The js-ready class enables CSS reveal animations.
   Without JavaScript, content remains visible.
*/

function initializeRevealAnimations() {
    if (!revealElements.length) {
        return;
    }

    if (
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        revealElements.forEach((element) => {
            element.classList.add("reveal-visible");
            element.classList.add("visible");
        });

        return;
    }

    /*
       Elements already visible on initial load should
       not disappear or flash.
    */

    revealElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();

        if (
            bounds.top < window.innerHeight &&
            bounds.bottom > 0
        ) {
            element.classList.add("reveal-visible");
            element.classList.add("visible");
        }
    });

    /*
       Enable CSS animation states.
    */

    document.documentElement.classList.add("js-ready");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("reveal-visible");
                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach((element) => {
        if (!element.classList.contains("reveal-visible")) {
            revealObserver.observe(element);
        }
    });
}

initializeRevealAnimations();

/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const activeSection = entry.target.id;

                navigationLinks.forEach((link) => {
                    const href = link.getAttribute("href") || "";

                    if (!href.startsWith("#")) {
                        return;
                    }

                    const target = href.slice(1);

                    link.classList.toggle(
                        "active",
                        target === activeSection
                    );
                });
            });
        },
        {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0
        }
    );

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

/* =========================================================
   MOUSE GLOW
========================================================= */

if (mouseGlow && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
        "pointermove",
        (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
        },
        {
            passive: true
        }
    );

    function animateMouseGlow() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        mouseGlow.style.left = `${currentX}px`;
        mouseGlow.style.top = `${currentY}px`;

        requestAnimationFrame(animateMouseGlow);
    }

    animateMouseGlow();
}

/* =========================================================
   PROJECT IMAGE TILT
========================================================= */

const interactiveImages = document.querySelectorAll(
    ".featured-image, .project-image"
);

if (!prefersReducedMotion) {
    interactiveImages.forEach((image) => {
        image.addEventListener("pointermove", (event) => {
            if (window.innerWidth <= 780) {
                return;
            }

            const bounds = image.getBoundingClientRect();

            const relativeX =
                (event.clientX - bounds.left) / bounds.width;

            const relativeY =
                (event.clientY - bounds.top) / bounds.height;

            const rotateY = (relativeX - 0.5) * 2.5;
            const rotateX = (0.5 - relativeY) * 2.5;

            image.style.transform =
                `perspective(900px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)`;
        });

        image.addEventListener("pointerleave", () => {
            image.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg)";
        });
    });
}

/* =========================================================
   SMOOTH INTERNAL LINKS
========================================================= */

const internalLinks = document.querySelectorAll(
    'a[href^="#"]'
);

internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement = document.getElementById(
            targetId.slice(1)
        );

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        closeMenu();

        targetElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start"
        });
    });
});
