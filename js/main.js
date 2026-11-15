/**
 * Student Portfolio — Core JavaScript Module
 * Handles responsive navigation, reveal animations, dynamic filters,
 * interactive Academic Planner, and Contact form validation.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "wilson_ekelem_planner_tasks_v1";

  const DEFAULT_TASKS = [
    {
      id: 101,
      title: "Review Network Security & Firewall Lab",
      course: "CYB 201",
      dueDate: "2026-11-20",
      priority: "High",
      completed: false
    },
    {
      id: 102,
      title: "Render 3D Product Commercial Sequence in Cinema 4D",
      course: "DES 202",
      dueDate: "2026-11-22",
      priority: "Medium",
      completed: false
    },
    {
      id: 103,
      title: "Complete Applied Cryptography Problem Set",
      course: "CYB 204",
      dueDate: "2026-11-18",
      priority: "Low",
      completed: true
    }
  ];

  const PRIORITY_BADGES = {
    High: "badge-danger",
    Medium: "badge-warning",
    Low: "badge-accent"
  };

  /**
   * Initialize shared UI behaviors on every page.
   */
  document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initButtonClickAnimations();
    initDynamicFooterYear();
    initScrollReveal();
    initAboutSkillFilter();
    initProjectsPage();
    initAcademicPlanner();
    initContactForm();
  });

  /**
   * Subtle click animation (bounce + ripple) on all buttons and filter pills.
   */
  function initButtonClickAnimations() {
    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".btn, .filter-btn");
      if (!btn) return;

      btn.classList.remove("is-clicked");
      void btn.offsetWidth;
      btn.classList.add("is-clicked");

      const existingRipple = btn.querySelector(".btn-click-ripple");
      if (existingRipple) existingRipple.remove();

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "btn-click-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;

      const clientX = event.clientX || rect.left + rect.width / 2;
      const clientY = event.clientY || rect.top + rect.height / 2;
      ripple.style.left = `${clientX - rect.left - size / 2}px`;
      ripple.style.top = `${clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  }

  /**
   * Responsive mobile navigation drawer toggle.
   */
  function initMobileNavigation() {
    const toggleBtn = document.getElementById("navToggle");
    const navMenu = document.getElementById("siteNav");
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /**
   * Dynamically keep the footer year current.
   */
  function initDynamicFooterYear() {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * Progressive scroll-reveal transitions via IntersectionObserver.
   */
  function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /**
   * About Me Page: Interactive skill category filter.
   */
  function initAboutSkillFilter() {
    const filterContainer = document.getElementById("skillFilters");
    const skillItems = Array.from(document.querySelectorAll("[data-skill-category]"));
    if (!filterContainer || !skillItems.length) return;

    filterContainer.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;

      const selected = btn.getAttribute("data-filter");
      setActiveFilterButton(filterContainer, btn);

      skillItems.forEach((item) => {
        const category = item.getAttribute("data-skill-category");
        const visible = selected === "all" || category === selected;
        item.style.display = visible ? "" : "none";
      });
    });
  }

  /**
   * Projects Page: Category filtering + interactive live preview modal.
   */
  function initProjectsPage() {
    const filterContainer = document.getElementById("projectFilters");
    const projectCards = Array.from(document.querySelectorAll("[data-project-category]"));
    const countBadge = document.getElementById("projectCountBadge");

    if (filterContainer && projectCards.length) {
      filterContainer.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-filter]");
        if (!btn) return;

        const selected = btn.getAttribute("data-filter");
        setActiveFilterButton(filterContainer, btn);

        let visibleCount = 0;
        projectCards.forEach((card) => {
          const match = selected === "all" || card.getAttribute("data-project-category") === selected;
          card.classList.toggle("is-hidden", !match);
          if (match) visibleCount += 1;
        });

        if (countBadge) {
          countBadge.textContent = `${visibleCount} Project${visibleCount === 1 ? "" : "s"} Displayed`;
        }
      });
    }

    initProjectPreviewModal();
    initProjectVideoHoverPreview();
  }

  /**
   * Play muted video previews smoothly when hovering over project cards/thumbnails.
   */
  function initProjectVideoHoverPreview() {
    const cards = document.querySelectorAll(".project-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const thumb = card.querySelector(".project-thumb");
      const video = thumb ? thumb.querySelector("video") : null;
      if (!thumb || !video) return;

      if (!thumb.querySelector(".video-preview-pill")) {
        const pill = document.createElement("span");
        pill.className = "video-preview-pill";
        pill.textContent = "Hover to preview";
        pill.setAttribute("aria-hidden", "true");
        thumb.appendChild(pill);
      }

      const startPreview = () => {
        video.muted = true;
        video.loop = true;
        thumb.classList.add("is-previewing");
        video.play().catch(() => {});
      };

      const stopPreview = () => {
        thumb.classList.remove("is-previewing");
        if (!video.paused) {
          video.pause();
        }
      };

      card.addEventListener("mouseenter", startPreview);
      card.addEventListener("mouseleave", stopPreview);
    });
  }

  function initProjectPreviewModal() {
    const modal = document.getElementById("projectModal");
    const closeBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalProjectTitle");
    const modalBody = document.getElementById("modalProjectSummary");
    const modalTech = document.getElementById("modalProjectTech");
    const modalVideoWrap = document.getElementById("modalVideoWrap");
    const modalVideo = document.getElementById("modalProjectVideo");

    if (!modal || !closeBtn || !modalTitle || !modalBody || !modalTech) return;

    document.querySelectorAll("[data-preview-title]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        modalTitle.textContent = trigger.getAttribute("data-preview-title") || "Project Preview";
        modalBody.textContent = trigger.getAttribute("data-preview-summary") || "";
        modalTech.textContent = trigger.getAttribute("data-preview-tech") || "";

        const videoSrc = trigger.getAttribute("data-preview-video");
        if (modalVideoWrap && modalVideo) {
          if (videoSrc) {
            modalVideo.src = videoSrc;
            modalVideoWrap.classList.add("has-video");
            modalVideo.play().catch(() => {});
          } else {
            modalVideo.pause();
            modalVideo.removeAttribute("src");
            modalVideo.load();
            modalVideoWrap.classList.remove("has-video");
          }
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        closeBtn.focus();
      });
    });

    const closeModal = () => {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
      }
      if (modalVideoWrap) {
        modalVideoWrap.classList.remove("has-video");
      }
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    };

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  /**
   * Academic Planner Page: Array-backed interactive task management system.
   */
  function initAcademicPlanner() {
    const taskForm = document.getElementById("taskForm");
    const taskListEl = document.getElementById("taskList");
    if (!taskForm || !taskListEl) return;

    const titleInput = document.getElementById("taskTitle");
    const courseInput = document.getElementById("taskCourse");
    const dueInput = document.getElementById("taskDueDate");
    const priorityInput = document.getElementById("taskPriority");
    const formErrorEl = document.getElementById("plannerFormError");
    const filterContainer = document.getElementById("plannerFilters");
    const clearCompletedBtn = document.getElementById("clearCompletedBtn");

    let tasks = loadTasks();
    let currentFilter = "all";

    renderPlanner();

    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = titleInput.value.trim();

      if (!title) {
        showPlannerError("Please enter a task title before adding it to your planner.");
        titleInput.focus();
        return;
      }

      clearPlannerError();

      const newTask = {
        id: Date.now(),
        title,
        course: courseInput.value || "General",
        dueDate: dueInput.value || "No due date",
        priority: priorityInput.value || "Medium",
        completed: false
      };

      tasks = [newTask, ...tasks];
      saveTasks(tasks);
      taskForm.reset();
      renderPlanner();
    });

    taskListEl.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest("[data-action='delete']");
      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute("data-id"));
        tasks = deleteTaskById(tasks, id);
        saveTasks(tasks);
        renderPlanner();
      }
    });

    taskListEl.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-action='toggle']");
      if (!checkbox) return;

      const id = Number(checkbox.getAttribute("data-id"));
      tasks = toggleTaskById(tasks, id);
      saveTasks(tasks);
      renderPlanner();
    });

    if (filterContainer) {
      filterContainer.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-filter]");
        if (!btn) return;
        currentFilter = btn.getAttribute("data-filter") || "all";
        setActiveFilterButton(filterContainer, btn);
        renderPlanner();
      });
    }

    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener("click", () => {
        tasks = tasks.filter((task) => !task.completed);
        saveTasks(tasks);
        renderPlanner();
      });
    }

    function showPlannerError(message) {
      if (!formErrorEl) return;
      formErrorEl.textContent = message;
      titleInput.classList.add("is-invalid");
    }

    function clearPlannerError() {
      if (!formErrorEl) return;
      formErrorEl.textContent = "";
      titleInput.classList.remove("is-invalid");
    }

    function renderPlanner() {
      const filteredTasks = filterTaskArray(tasks, currentFilter);
      renderTaskList(taskListEl, filteredTasks, currentFilter);
      updatePlannerSummary(tasks);
    }
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...DEFAULT_TASKS];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [...DEFAULT_TASKS];
    } catch {
      return [...DEFAULT_TASKS];
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors in restricted browsing contexts.
    }
  }

  function toggleTaskById(tasks, taskId) {
    return tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
  }

  function deleteTaskById(tasks, taskId) {
    return tasks.filter((task) => task.id !== taskId);
  }

  function filterTaskArray(tasks, filter) {
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  function renderTaskList(container, tasks, currentFilter) {
    container.innerHTML = "";

    if (!tasks.length) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent =
        currentFilter === "all"
          ? "No tasks yet. Use the form to add your first academic task!"
          : `No ${currentFilter} tasks found.`;
      container.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item${task.completed ? " completed" : ""}`;

      const main = document.createElement("div");
      main.className = "task-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("data-action", "toggle");
      checkbox.setAttribute("data-id", String(task.id));
      checkbox.setAttribute("aria-label", `Mark "${task.title}" as ${task.completed ? "pending" : "completed"}`);

      const content = document.createElement("div");
      const titleEl = document.createElement("p");
      titleEl.className = "task-title";
      titleEl.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const courseBadge = document.createElement("span");
      courseBadge.className = "badge badge-primary";
      courseBadge.textContent = task.course;

      const priorityBadge = document.createElement("span");
      priorityBadge.className = `badge ${PRIORITY_BADGES[task.priority] || "badge-primary"}`;
      priorityBadge.textContent = `${task.priority} Priority`;

      const dueSpan = document.createElement("span");
      dueSpan.textContent = `Due: ${task.dueDate}`;

      meta.append(courseBadge, priorityBadge, dueSpan);
      content.append(titleEl, meta);
      main.append(checkbox, content);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-danger btn-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("data-action", "delete");
      deleteBtn.setAttribute("data-id", String(task.id));
      deleteBtn.setAttribute("aria-label", `Delete task ${task.title}`);

      actions.appendChild(deleteBtn);
      li.append(main, actions);
      container.appendChild(li);
    });
  }

  function updatePlannerSummary(tasks) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    setText("statTotal", String(total));
    setText("statCompleted", String(completed));
    setText("statPending", String(pending));
    setText("statPercent", `${percent}%`);

    const progressFill = document.getElementById("plannerProgressFill");
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
  }

  /**
   * Contact Page: Form validation ensuring:
   * 1. No field is empty
   * 2. Email format is valid
   * 3. Phone number contains only digits
   */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const fields = {
      name: {
        input: document.getElementById("contactName"),
        error: document.getElementById("errorName"),
        validate: validateRequired("Full name is required.")
      },
      email: {
        input: document.getElementById("contactEmail"),
        error: document.getElementById("errorEmail"),
        validate: validateEmail
      },
      phone: {
        input: document.getElementById("contactPhone"),
        error: document.getElementById("errorPhone"),
        validate: validateDigitsOnlyPhone
      },
      message: {
        input: document.getElementById("contactMessage"),
        error: document.getElementById("errorMessage"),
        validate: validateRequired("Please enter your message.")
      }
    };

    const statusBanner = document.getElementById("contactStatus");

    Object.values(fields).forEach(({ input, error, validate }) => {
      if (!input || !error) return;
      input.addEventListener("blur", () => runFieldValidation(input, error, validate));
      input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) {
          runFieldValidation(input, error, validate);
        }
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let allValid = true;
      let firstInvalid = null;

      Object.values(fields).forEach(({ input, error, validate }) => {
        const isValid = runFieldValidation(input, error, validate);
        if (!isValid) {
          allValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!allValid) {
        showStatusBanner(
          statusBanner,
          "alert-error",
          "Please fix the highlighted fields before submitting your message."
        );
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const senderName = fields.name.input.value.trim();
      showStatusBanner(
        statusBanner,
        "alert-success",
        `Thank you, ${senderName}! Your message has been validated and recorded. I will get back to you shortly.`
      );

      form.reset();
      Object.values(fields).forEach(({ input }) => {
        input.classList.remove("is-valid", "is-invalid");
        input.removeAttribute("aria-invalid");
      });
    });
  }

  function runFieldValidation(input, errorEl, validator) {
    if (!input || !errorEl) return true;
    const errorMessage = validator(input.value.trim());

    if (errorMessage) {
      errorEl.textContent = errorMessage;
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      input.setAttribute("aria-invalid", "true");
      return false;
    }

    errorEl.textContent = "";
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
    return true;
  }

  function validateRequired(message) {
    return (value) => (value.length === 0 ? message : "");
  }

  function validateEmail(value) {
    if (value.length === 0) {
      return "Email address is required.";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(value)
      ? ""
      : "Please enter a valid email address (e.g., student@example.com).";
  }

  function validateDigitsOnlyPhone(value) {
    if (value.length === 0) {
      return "Phone number is required.";
    }
    if (!/^\d+$/.test(value)) {
      return "Phone number must contain only digits (0-9), with no spaces or symbols.";
    }
    if (value.length < 7 || value.length > 15) {
      return "Phone number should be between 7 and 15 digits.";
    }
    return "";
  }

  function showStatusBanner(banner, variantClass, text) {
    if (!banner) return;
    banner.className = `alert ${variantClass} show`;
    banner.textContent = text;
  }

  function setActiveFilterButton(container, activeBtn) {
    container.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.classList.toggle("active", btn === activeBtn);
    });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
})();
