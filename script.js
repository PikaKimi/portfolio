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

    if (window.scrollY > 30) {
        header.classList.add("header-scrolled");
    } else {
        header.classList.remove("header-scrolled");
    }
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
   SCROLL REVEAL
========================================================= */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
    revealElements.forEach((element) => {
        element.classList.add("reveal-visible");
    });
} else {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("reveal-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -60px 0px"
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
}


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const activeSection = entry.target.id;

            navigationLinks.forEach((link) => {
                const target = link
                    .getAttribute("href")
                    .replace("#", "");

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

        const targetElement = document.querySelector(targetId);

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        targetElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start"
        });
    });
});