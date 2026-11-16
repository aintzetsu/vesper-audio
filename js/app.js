/* ==========================================================================
   Vesper Audio — Application Controller & Interactive State
   ========================================================================== */

(function (global) {
  "use strict";

  const STORAGE_THEME = "vesper_theme";
  const STORAGE_CART = "vesper_cart";
  const SHIPPING_THRESHOLD = 600;
  const PAIR_DISCOUNT = 80;

  const Data = global.VesperData;

  function safeStorageGet(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (_err) {
      // Ignore storage failures in restricted contexts
    }
  }

  function formatMoney(amount) {
    return "$" + Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function getInitialTheme() {
    const saved = safeStorageGet(STORAGE_THEME, null);
    if (saved === "light" || saved === "dark") return saved;
    if (global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  const state = {
    theme: getInitialTheme(),
    heroFinish: "obsidian",
    customizer: {
      finishId: "obsidian",
      edition: "single",
      blueprint: false
    },
    catalog: {
      category: "all",
      sort: "featured",
      cardFinishes: {}
    },
    activeProfile: "flat",
    modal: {
      open: false,
      productId: null,
      finishId: "obsidian"
    },
    cartOpen: false,
    cart: safeStorageGet(STORAGE_CART, []),
    promoCode: null,
    checkoutReceipt: null,
    lastFocused: null
  };

  let visualizer = null;

  /* ------------------------------------------------------------------------
     DOM References
     ------------------------------------------------------------------------ */
  const dom = {};

  function cacheDom() {
    dom.themeToggle = document.getElementById("theme-toggle");
    dom.themeIcon = document.getElementById("theme-icon");
    dom.mobileMenuBtn = document.getElementById("mobile-menu-btn");
    dom.mobileNav = document.getElementById("mobile-nav");

    dom.heroArtwork = document.getElementById("hero-artwork");
    dom.heroFinishLabel = document.getElementById("hero-finish-label");
    dom.heroSwatches = document.getElementById("hero-swatches");

    dom.customizerArtwork = document.getElementById("customizer-artwork");
    dom.customizerTitle = document.getElementById("customizer-title");
    dom.customizerSku = document.getElementById("customizer-sku");
    dom.customizerPrice = document.getElementById("customizer-price");
    dom.customizerPriceNote = document.getElementById("customizer-price-note");
    dom.customizerMaterial = document.getElementById("customizer-material");
    dom.customizerFinishGrid = document.getElementById("customizer-finish-grid");
    dom.customizerFinishName = document.getElementById("customizer-finish-name");
    dom.blueprintOverlay = document.getElementById("blueprint-overlay");
    dom.viewToggleBtns = document.querySelectorAll("[data-view-mode]");
    dom.editionBtns = document.querySelectorAll("[data-edition]");
    dom.addConfiguredBtn = document.getElementById("add-configured-btn");

    dom.filterTabs = document.querySelectorAll("[data-filter]");
    dom.sortSelect = document.getElementById("catalog-sort");
    dom.catalogGrid = document.getElementById("catalog-grid");

    dom.presetTabs = document.querySelectorAll("[data-preset]");
    dom.presetSubtitle = document.getElementById("preset-subtitle");
    dom.presetDesc = document.getElementById("preset-desc");
    dom.toneToggleBtn = document.getElementById("tone-toggle-btn");
    dom.acousticCanvas = document.getElementById("acoustic-canvas");

    dom.faqTriggers = document.querySelectorAll(".faq-trigger");
    dom.newsletterForm = document.getElementById("newsletter-form");
    dom.newsletterInput = document.getElementById("newsletter-email");
    dom.newsletterFeedback = document.getElementById("newsletter-feedback");

    dom.backdrop = document.getElementById("overlay-backdrop");
    dom.modal = document.getElementById("product-modal");
    dom.modalClose = document.getElementById("modal-close");
    dom.modalArtwork = document.getElementById("modal-artwork");
    dom.modalSku = document.getElementById("modal-sku");
    dom.modalTitle = document.getElementById("modal-title");
    dom.modalDesc = document.getElementById("modal-desc");
    dom.modalSwatches = document.getElementById("modal-swatches");
    dom.modalFinishName = document.getElementById("modal-finish-name");
    dom.modalSpecs = document.getElementById("modal-specs");
    dom.modalPrice = document.getElementById("modal-price");
    dom.modalAddBtn = document.getElementById("modal-add-btn");

    dom.cartTrigger = document.getElementById("cart-trigger");
    dom.cartBadge = document.getElementById("cart-badge");
    dom.cartDrawer = document.getElementById("cart-drawer");
    dom.cartClose = document.getElementById("cart-close");
    dom.cartItems = document.getElementById("cart-items");
    dom.shippingMessage = document.getElementById("shipping-message");
    dom.shippingFill = document.getElementById("shipping-fill");
    dom.cartFooter = document.getElementById("cart-footer");
    dom.promoForm = document.getElementById("promo-form");
    dom.promoInput = document.getElementById("promo-input");
    dom.promoFeedback = document.getElementById("promo-feedback");
    dom.cartSubtotal = document.getElementById("cart-subtotal");
    dom.cartDiscountRow = document.getElementById("cart-discount-row");
    dom.cartDiscount = document.getElementById("cart-discount");
    dom.cartTotal = document.getElementById("cart-total");
    dom.checkoutBtn = document.getElementById("checkout-btn");
    dom.clearCartBtn = document.getElementById("clear-cart-btn");
    dom.toastStack = document.getElementById("toast-stack");
  }

  /* ------------------------------------------------------------------------
     Theme & Toast Helpers
     ------------------------------------------------------------------------ */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    safeStorageSet(STORAGE_THEME, theme);

    if (dom.themeToggle && dom.themeIcon) {
      const isDark = theme === "dark";
      dom.themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      dom.themeToggle.setAttribute("aria-pressed", String(isDark));
      dom.themeIcon.textContent = isDark ? "SUN" : "DRK";
    }
    if (visualizer) {
      visualizer.redraw();
    }
  }

  function showToast(message) {
    if (!dom.toastStack) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    const dot = document.createElement("span");
    dot.className = "toast__dot";
    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(dot);
    toast.appendChild(text);
    dom.toastStack.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(6px)";
      toast.style.transition = "opacity 200ms ease, transform 200ms ease";
      setTimeout(function () {
        toast.remove();
      }, 220);
    }, 2600);
  }

  /* ------------------------------------------------------------------------
     Hero Preview Swatches
     ------------------------------------------------------------------------ */
  function renderHeroPreview() {
    const product = Data.getProduct("va-01");
    const finish = Data.getFinish(state.heroFinish);
    if (dom.heroArtwork) {
      dom.heroArtwork.innerHTML = Data.renderProductSvg(product.id, finish.id);
    }
    if (dom.heroFinishLabel) {
      dom.heroFinishLabel.textContent = finish.name;
    }
    if (dom.heroSwatches) {
      dom.heroSwatches.innerHTML = "";
      product.finishes.forEach(function (fId) {
        const f = Data.getFinish(fId);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "swatch-dot swatch-dot--sm" + (fId === state.heroFinish ? " is-selected" : "");
        btn.style.backgroundColor = f.swatch;
        btn.setAttribute("aria-label", "Preview " + f.name + " finish");
        btn.setAttribute("aria-pressed", String(fId === state.heroFinish));
        btn.addEventListener("click", function () {
          state.heroFinish = fId;
          renderHeroPreview();
        });
        dom.heroSwatches.appendChild(btn);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Interactive Hardware Customizer (VA-01)
     ------------------------------------------------------------------------ */
  function computeCustomizerPrice() {
    const product = Data.getProduct("va-01");
    const finish = Data.getFinish(state.customizer.finishId);
    const singleUnit = product.basePrice + finish.priceDelta;
    if (state.customizer.edition === "pair") {
      return singleUnit * 2 - PAIR_DISCOUNT;
    }
    return singleUnit;
  }

  function renderCustomizer() {
    const product = Data.getProduct("va-01");
    const finish = Data.getFinish(state.customizer.finishId);
    const isPair = state.customizer.edition === "pair";
    const total = computeCustomizerPrice();

    if (dom.customizerArtwork) {
      dom.customizerArtwork.innerHTML = Data.renderProductSvg(product.id, finish.id);
    }
    if (dom.customizerSku) {
      dom.customizerSku.textContent =
        product.sku + "-" + finish.code + (isPair ? "-PAIR" : "-SGL");
    }
    if (dom.customizerPrice) {
      dom.customizerPrice.textContent = formatMoney(total);
    }
    if (dom.customizerPriceNote) {
      dom.customizerPriceNote.textContent = isPair
        ? "Matched stereo pair · Save $80"
        : "Single studio monitor";
    }
    if (dom.customizerFinishName) {
      dom.customizerFinishName.textContent = finish.name;
    }
    if (dom.customizerMaterial) {
      dom.customizerMaterial.textContent = finish.material;
    }
    if (dom.blueprintOverlay) {
      dom.blueprintOverlay.classList.toggle("is-visible", state.customizer.blueprint);
    }

    dom.viewToggleBtns.forEach(function (btn) {
      const isActive = (btn.dataset.viewMode === "specs") === state.customizer.blueprint;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    dom.editionBtns.forEach(function (btn) {
      const isSelected = btn.dataset.edition === state.customizer.edition;
      btn.classList.toggle("is-selected", isSelected);
      btn.setAttribute("aria-pressed", String(isSelected));
    });

    if (dom.customizerFinishGrid) {
      dom.customizerFinishGrid.innerHTML = "";
      product.finishes.forEach(function (fId) {
        const f = Data.getFinish(fId);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "finish-card" + (fId === finish.id ? " is-selected" : "");
        btn.setAttribute("aria-pressed", String(fId === finish.id));

        const dot = document.createElement("span");
        dot.className = "swatch-dot";
        dot.style.backgroundColor = f.swatch;

        const info = document.createElement("span");
        const nameEl = document.createElement("span");
        nameEl.className = "finish-card__name";
        nameEl.textContent = f.name;

        const subEl = document.createElement("span");
        subEl.className = "finish-card__sub";
        subEl.textContent = f.priceDelta === 0 ? "Included" : "+" + formatMoney(f.priceDelta);

        info.appendChild(nameEl);
        info.appendChild(subEl);
        btn.appendChild(dot);
        btn.appendChild(info);

        btn.addEventListener("click", function () {
          state.customizer.finishId = fId;
          renderCustomizer();
        });
        dom.customizerFinishGrid.appendChild(btn);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Filterable Product Catalog
     ------------------------------------------------------------------------ */
  function getFilteredProducts() {
    let items = Data.PRODUCTS.filter(function (p) {
      return state.catalog.category === "all" || p.category === state.catalog.category;
    });

    if (state.catalog.sort === "price-asc") {
      items = items.slice().sort(function (a, b) {
        return a.basePrice - b.basePrice;
      });
    } else if (state.catalog.sort === "price-desc") {
      items = items.slice().sort(function (a, b) {
        return b.basePrice - a.basePrice;
      });
    }
    return items;
  }

  function renderCatalog() {
    if (!dom.catalogGrid) return;
    const items = getFilteredProducts();
    dom.catalogGrid.innerHTML = "";

    items.forEach(function (product) {
      const activeFinishId = state.catalog.cardFinishes[product.id] || product.finishes[0];
      const finish = Data.getFinish(activeFinishId);
      const unitPrice = product.basePrice + finish.priceDelta;

      const card = document.createElement("article");
      card.className = "product-card";

      // Top SKU + Badge row
      const top = document.createElement("div");
      top.className = "product-card__top";
      const sku = document.createElement("span");
      sku.className = "sku-pill";
      sku.textContent = product.sku + " · " + product.categoryLabel;
      const badge = document.createElement("span");
      badge.className = "badge" + (product.badgeVariant === "accent" ? " badge--accent" : "");
      badge.textContent = product.badge;
      top.appendChild(sku);
      top.appendChild(badge);

      // Artwork container (opens Quick View)
      const media = document.createElement("div");
      media.className = "product-card__media";
      media.setAttribute("role", "button");
      media.setAttribute("tabindex", "0");
      media.setAttribute("aria-label", "Inspect " + product.name + " technical details");
      media.innerHTML = Data.renderProductSvg(product.id, finish.id);
      media.addEventListener("click", function () {
        openModal(product.id, activeFinishId);
      });
      media.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openModal(product.id, activeFinishId);
        }
      });

      // Body
      const body = document.createElement("div");
      body.className = "product-card__body";
      const title = document.createElement("h3");
      title.className = "product-card__title";
      title.textContent = product.name;
      const desc = document.createElement("p");
      desc.className = "product-card__desc";
      desc.textContent = product.tagline;

      const swatches = document.createElement("div");
      swatches.className = "product-card__swatches";
      product.finishes.forEach(function (fId) {
        const f = Data.getFinish(fId);
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "swatch-dot swatch-dot--sm" + (fId === activeFinishId ? " is-selected" : "");
        dot.style.backgroundColor = f.swatch;
        dot.setAttribute("aria-label", "Select " + f.name + " for " + product.name);
        dot.addEventListener("click", function () {
          state.catalog.cardFinishes[product.id] = fId;
          renderCatalog();
        });
        swatches.appendChild(dot);
      });

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(swatches);

      // Footer
      const footer = document.createElement("div");
      footer.className = "product-card__footer";
      const price = document.createElement("span");
      price.className = "product-card__price";
      price.textContent = formatMoney(unitPrice);

      const actions = document.createElement("div");
      actions.className = "product-card__actions";

      const specsBtn = document.createElement("button");
      specsBtn.type = "button";
      specsBtn.className = "btn btn--ghost btn--sm";
      specsBtn.textContent = "Specs";
      specsBtn.addEventListener("click", function () {
        openModal(product.id, activeFinishId);
      });

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn--primary btn--sm";
      addBtn.textContent = "+ Add";
      addBtn.addEventListener("click", function () {
        addToCart(product.id, activeFinishId, "single");
      });

      actions.appendChild(specsBtn);
      actions.appendChild(addBtn);
      footer.appendChild(price);
      footer.appendChild(actions);

      card.appendChild(top);
      card.appendChild(media);
      card.appendChild(body);
      card.appendChild(footer);
      dom.catalogGrid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     Quick-View Product Modal
     ------------------------------------------------------------------------ */
  function openModal(productId, finishId) {
    state.lastFocused = document.activeElement;
    state.modal.open = true;
    state.modal.productId = productId;
    const product = Data.getProduct(productId);
    state.modal.finishId = finishId || product.finishes[0];

    renderModal();
    dom.modal.classList.add("is-open");
    dom.modal.setAttribute("aria-hidden", "false");
    syncBackdrop();
    dom.modalClose.focus();
  }

  function closeModal() {
    if (!state.modal.open) return;
    state.modal.open = false;
    dom.modal.classList.remove("is-open");
    dom.modal.setAttribute("aria-hidden", "true");
    syncBackdrop();
    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
  }

  function renderModal() {
    if (!state.modal.productId) return;
    const product = Data.getProduct(state.modal.productId);
    const finish = Data.getFinish(state.modal.finishId);
    const unitPrice = product.basePrice + finish.priceDelta;

    dom.modalArtwork.innerHTML = Data.renderProductSvg(product.id, finish.id);
    dom.modalSku.textContent = product.sku + "-" + finish.code;
    dom.modalTitle.textContent = product.name;
    dom.modalDesc.textContent = product.description;
    dom.modalFinishName.textContent = finish.name + " · " + finish.material;
    dom.modalPrice.textContent = formatMoney(unitPrice);

    dom.modalSwatches.innerHTML = "";
    product.finishes.forEach(function (fId) {
      const f = Data.getFinish(fId);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch-dot swatch-dot--sm" + (fId === finish.id ? " is-selected" : "");
      btn.style.backgroundColor = f.swatch;
      btn.setAttribute("aria-label", "Select " + f.name);
      btn.addEventListener("click", function () {
        state.modal.finishId = fId;
        renderModal();
      });
      dom.modalSwatches.appendChild(btn);
    });

    dom.modalSpecs.innerHTML = "";
    Object.keys(product.specs).forEach(function (label) {
      const row = document.createElement("div");
      row.className = "modal__spec-row";
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = product.specs[label];
      row.appendChild(dt);
      row.appendChild(dd);
      dom.modalSpecs.appendChild(row);
    });
  }

  /* ------------------------------------------------------------------------
     Slide-Over Shopping Cart Drawer
     ------------------------------------------------------------------------ */
  function saveCart() {
    safeStorageSet(STORAGE_CART, state.cart);
  }

  function addToCart(productId, finishId, edition) {
    const product = Data.getProduct(productId);
    const finish = Data.getFinish(finishId || product.finishes[0]);
    const isPair = edition === "pair";
    const unitPrice = isPair
      ? (product.basePrice + finish.priceDelta) * 2 - PAIR_DISCOUNT
      : product.basePrice + finish.priceDelta;
    const key = [product.id, finish.id, edition].join(":");

    state.checkoutReceipt = null;

    const existing = state.cart.find(function (item) {
      return item.key === key;
    });
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        key: key,
        productId: product.id,
        finishId: finish.id,
        edition: edition,
        name: product.name + (isPair ? " (Matched Pair)" : ""),
        sku: product.sku + "-" + finish.code + (isPair ? "-PAIR" : ""),
        finishName: finish.name,
        swatch: finish.swatch,
        unitPrice: unitPrice,
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    showToast("Added " + product.name + " (" + finish.name + ") to cart");
  }

  function updateQuantity(key, delta) {
    const item = state.cart.find(function (entry) {
      return entry.key === key;
    });
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(function (entry) {
        return entry.key !== key;
      });
    }
    saveCart();
    renderCart();
  }

  function openCart() {
    state.lastFocused = document.activeElement;
    state.cartOpen = true;
    dom.cartDrawer.classList.add("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "false");
    syncBackdrop();
    dom.cartClose.focus();
  }

  function closeCart() {
    if (!state.cartOpen) return;
    state.cartOpen = false;
    dom.cartDrawer.classList.remove("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "true");
    syncBackdrop();
    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
  }

  function syncBackdrop() {
    const active = state.modal.open || state.cartOpen;
    dom.backdrop.classList.toggle("is-open", active);
    document.body.style.overflow = active ? "hidden" : "";
  }

  function renderCart() {
    const totalCount = state.cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    const subtotal = state.cart.reduce(function (sum, item) {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    if (dom.cartBadge) {
      dom.cartBadge.textContent = String(totalCount);
    }

    // Shipping progress
    const progressPct = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
    if (dom.shippingFill) {
      dom.shippingFill.style.width = progressPct + "%";
    }
    if (dom.shippingMessage) {
      if (subtotal === 0) {
        dom.shippingMessage.textContent =
          "Complimentary insured studio courier on orders over " + formatMoney(SHIPPING_THRESHOLD);
      } else if (subtotal >= SHIPPING_THRESHOLD) {
        dom.shippingMessage.textContent = "Unlocked: Free insured studio courier shipping";
      } else {
        dom.shippingMessage.textContent =
          "Add " + formatMoney(SHIPPING_THRESHOLD - subtotal) + " more for free insured shipping";
      }
    }

    if (!dom.cartItems) return;
    dom.cartItems.innerHTML = "";

    if (state.checkoutReceipt) {
      const box = document.createElement("div");
      box.className = "checkout-confirmation";
      const h3 = document.createElement("h3");
      h3.textContent = "Studio Order Reserved · " + state.checkoutReceipt.orderRef;
      const p1 = document.createElement("p");
      p1.textContent =
        "Simulated checkout complete for " + formatMoney(state.checkoutReceipt.total) +
        ". Each unit undergoes a 24-hour Berlin acoustic burn-in before dispatch.";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--secondary btn--sm";
      btn.textContent = "Continue Exploring";
      btn.addEventListener("click", function () {
        state.checkoutReceipt = null;
        closeCart();
      });
      box.appendChild(h3);
      box.appendChild(p1);
      box.appendChild(btn);
      dom.cartItems.appendChild(box);
      dom.cartFooter.hidden = true;
      return;
    }

    if (state.cart.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cart-empty";
      const title = document.createElement("p");
      title.className = "cart-empty__title";
      title.textContent = "Your studio bag is empty";
      const hint = document.createElement("p");
      hint.textContent = "Configure a monitor above or add hardware from the catalog.";
      empty.appendChild(title);
      empty.appendChild(hint);
      dom.cartItems.appendChild(empty);
      dom.cartFooter.hidden = true;
      return;
    }

    dom.cartFooter.hidden = false;

    state.cart.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "cart-item";

      const thumb = document.createElement("div");
      thumb.className = "cart-item__thumb";
      thumb.innerHTML = Data.renderProductSvg(item.productId, item.finishId);

      const info = document.createElement("div");

      const head = document.createElement("div");
      head.className = "cart-item__head";
      const name = document.createElement("p");
      name.className = "cart-item__name";
      name.textContent = item.name;
      const lineTotal = document.createElement("span");
      lineTotal.className = "mono";
      lineTotal.textContent = formatMoney(item.unitPrice * item.quantity);
      head.appendChild(name);
      head.appendChild(lineTotal);

      const meta = document.createElement("div");
      meta.className = "cart-item__meta";
      const sw = document.createElement("span");
      sw.className = "cart-item__swatch";
      sw.style.backgroundColor = item.swatch;
      const metaText = document.createElement("span");
      metaText.textContent = item.finishName + " · " + item.sku;
      meta.appendChild(sw);
      meta.appendChild(metaText);

      const controls = document.createElement("div");
      controls.className = "cart-item__controls";

      const stepper = document.createElement("div");
      stepper.className = "qty-stepper";
      const decBtn = document.createElement("button");
      decBtn.type = "button";
      decBtn.textContent = "-";
      decBtn.setAttribute("aria-label", "Decrease quantity for " + item.name);
      decBtn.addEventListener("click", function () {
        updateQuantity(item.key, -1);
      });

      const qtyVal = document.createElement("span");
      qtyVal.textContent = String(item.quantity);

      const incBtn = document.createElement("button");
      incBtn.type = "button";
      incBtn.textContent = "+";
      incBtn.setAttribute("aria-label", "Increase quantity for " + item.name);
      incBtn.addEventListener("click", function () {
        updateQuantity(item.key, 1);
      });

      stepper.appendChild(decBtn);
      stepper.appendChild(qtyVal);
      stepper.appendChild(incBtn);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", function () {
        updateQuantity(item.key, -item.quantity);
      });

      controls.appendChild(stepper);
      controls.appendChild(removeBtn);

      info.appendChild(head);
      info.appendChild(meta);
      info.appendChild(controls);

      row.appendChild(thumb);
      row.appendChild(info);
      dom.cartItems.appendChild(row);
    });

    const discount = state.promoCode === "STUDIO10" ? Math.round(subtotal * 0.1) : 0;
    const finalTotal = Math.max(0, subtotal - discount);

    dom.cartSubtotal.textContent = formatMoney(subtotal);
    if (discount > 0) {
      dom.cartDiscountRow.hidden = false;
      dom.cartDiscount.textContent = "-" + formatMoney(discount);
    } else {
      dom.cartDiscountRow.hidden = true;
    }
    dom.cartTotal.textContent = formatMoney(finalTotal);
  }

  /* ------------------------------------------------------------------------
     Sound Profile Visualizer & Controls
     ------------------------------------------------------------------------ */
  function setActiveSoundProfile(profileId) {
    state.activeProfile = profileId;
    const profile = Data.SOUND_PROFILES[profileId] || Data.SOUND_PROFILES.flat;

    dom.presetTabs.forEach(function (btn) {
      const isSelected = btn.dataset.preset === profileId;
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-pressed", String(isSelected));
    });

    if (dom.presetSubtitle) dom.presetSubtitle.textContent = profile.subtitle;
    if (dom.presetDesc) dom.presetDesc.textContent = profile.description;
    if (visualizer) visualizer.setProfile(profileId);
  }

  /* ------------------------------------------------------------------------
     Event Bindings
     ------------------------------------------------------------------------ */
  function bindEvents() {
    if (dom.themeToggle) {
      dom.themeToggle.addEventListener("click", function () {
        applyTheme(state.theme === "dark" ? "light" : "dark");
      });
    }

    if (dom.mobileMenuBtn && dom.mobileNav) {
      dom.mobileMenuBtn.addEventListener("click", function () {
        const open = dom.mobileNav.classList.toggle("is-open");
        dom.mobileMenuBtn.setAttribute("aria-expanded", String(open));
      });
      dom.mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          dom.mobileNav.classList.remove("is-open");
          dom.mobileMenuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }

    dom.viewToggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.customizer.blueprint = btn.dataset.viewMode === "specs";
        renderCustomizer();
      });
    });

    dom.editionBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.customizer.edition = btn.dataset.edition;
        renderCustomizer();
      });
    });

    if (dom.addConfiguredBtn) {
      dom.addConfiguredBtn.addEventListener("click", function () {
        addToCart("va-01", state.customizer.finishId, state.customizer.edition);
        openCart();
      });
    }

    dom.filterTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.catalog.category = tab.dataset.filter;
        dom.filterTabs.forEach(function (el) {
          const active = el === tab;
          el.classList.toggle("is-active", active);
          el.setAttribute("aria-pressed", String(active));
        });
        renderCatalog();
      });
    });

    if (dom.sortSelect) {
      dom.sortSelect.addEventListener("change", function () {
        state.catalog.sort = dom.sortSelect.value;
        renderCatalog();
      });
    }

    dom.presetTabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setActiveSoundProfile(btn.dataset.preset);
      });
    });

    if (dom.toneToggleBtn) {
      dom.toneToggleBtn.addEventListener("click", function () {
        if (!visualizer) return;
        const playing = visualizer.toggleTone(state.activeProfile);
        if (!playing && !global.AudioContext && !global.webkitAudioContext) {
          showToast("Web Audio is unavailable in this browser");
        }
      });
    }

    dom.faqTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        const panelId = trigger.getAttribute("aria-controls");
        const panel = document.getElementById(panelId);
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.classList.toggle("is-open", !expanded);
      });
    });

    if (dom.newsletterForm) {
      dom.newsletterForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        const email = dom.newsletterInput.value.trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        dom.newsletterFeedback.classList.remove("form-feedback--error", "form-feedback--success");
        if (!valid) {
          dom.newsletterFeedback.textContent = "Please enter a valid studio email address.";
          dom.newsletterFeedback.classList.add("form-feedback--error");
          dom.newsletterInput.focus();
          return;
        }
        dom.newsletterFeedback.textContent =
          "Subscribed " + email + " to quarterly acoustic engineering notes.";
        dom.newsletterFeedback.classList.add("form-feedback--success");
        dom.newsletterForm.reset();
        showToast("Subscribed to Vesper Journal");
      });
    }

    if (dom.modalClose) dom.modalClose.addEventListener("click", closeModal);
    if (dom.modal) {
      dom.modal.addEventListener("click", function (ev) {
        if (ev.target === dom.modal) closeModal();
      });
    }
    if (dom.modalAddBtn) {
      dom.modalAddBtn.addEventListener("click", function () {
        if (!state.modal.productId) return;
        addToCart(state.modal.productId, state.modal.finishId, "single");
        closeModal();
        openCart();
      });
    }

    if (dom.cartTrigger) dom.cartTrigger.addEventListener("click", openCart);
    if (dom.cartClose) dom.cartClose.addEventListener("click", closeCart);
    if (dom.backdrop) {
      dom.backdrop.addEventListener("click", function () {
        closeModal();
        closeCart();
      });
    }

    if (dom.promoForm) {
      dom.promoForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        const code = dom.promoInput.value.trim().toUpperCase();
        dom.promoFeedback.classList.remove("form-feedback--error", "form-feedback--success");
        if (code === "STUDIO10") {
          state.promoCode = code;
          dom.promoFeedback.textContent = "Applied STUDIO10 (10% studio discount).";
          dom.promoFeedback.classList.add("form-feedback--success");
          renderCart();
        } else {
          state.promoCode = null;
          dom.promoFeedback.textContent = "Invalid code. Try STUDIO10 for demo discount.";
          dom.promoFeedback.classList.add("form-feedback--error");
          renderCart();
        }
      });
    }

    if (dom.clearCartBtn) {
      dom.clearCartBtn.addEventListener("click", function () {
        state.cart = [];
        state.promoCode = null;
        if (dom.promoFeedback) dom.promoFeedback.textContent = "";
        saveCart();
        renderCart();
        showToast("Cart cleared");
      });
    }

    if (dom.checkoutBtn) {
      dom.checkoutBtn.addEventListener("click", function () {
        if (state.cart.length === 0) return;
        const subtotal = state.cart.reduce(function (s, i) {
          return s + i.unitPrice * i.quantity;
        }, 0);
        const discount = state.promoCode === "STUDIO10" ? Math.round(subtotal * 0.1) : 0;
        const orderRef = "VA-" + Math.floor(100000 + Math.random() * 900000);
        state.checkoutReceipt = {
          orderRef: orderRef,
          total: Math.max(0, subtotal - discount)
        };
        state.cart = [];
        state.promoCode = null;
        saveCart();
        renderCart();
        showToast("Order " + orderRef + " simulated");
      });
    }

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        closeModal();
        closeCart();
        if (dom.mobileNav && dom.mobileNav.classList.contains("is-open")) {
          dom.mobileNav.classList.remove("is-open");
          dom.mobileMenuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    cacheDom();
    applyTheme(state.theme);

    if (global.VesperVisualizer && dom.acousticCanvas) {
      visualizer = global.VesperVisualizer.create(dom.acousticCanvas, function (isPlaying) {
        if (dom.toneToggleBtn) {
          dom.toneToggleBtn.textContent = isPlaying ? "Stop Reference Tone" : "Play Reference Tone";
          dom.toneToggleBtn.setAttribute("aria-pressed", String(isPlaying));
        }
      });
      if (visualizer) visualizer.start();
    }

    renderHeroPreview();
    renderCustomizer();
    renderCatalog();
    setActiveSoundProfile(state.activeProfile);
    renderCart();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
