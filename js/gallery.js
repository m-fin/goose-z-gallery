(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-full]"));
  var dialog = document.getElementById("lightbox");
  if (!frames.length || !dialog || !dialog.showModal) return;

  var stage = dialog.querySelector(".lightbox-stage");
  var caption = document.getElementById("lightbox-caption");
  var count = document.getElementById("lightbox-count");
  var picture = document.createElement("picture");
  var source = document.createElement("source");
  var image = document.createElement("img");
  var index = 0;

  source.type = "image/webp";
  image.decoding = "async";
  image.loading = "eager";
  picture.appendChild(source);
  picture.appendChild(image);
  stage.appendChild(picture);

  function show(nextIndex) {
    index = (nextIndex + frames.length) % frames.length;
    var frame = frames[index];
    source.srcset = frame.getAttribute("data-full-webp");
    image.src = frame.getAttribute("data-full");
    image.width = frame.getAttribute("data-width");
    image.height = frame.getAttribute("data-height");
    image.alt = frame.getAttribute("data-alt") || "";
    caption.textContent = frame.getAttribute("data-caption") || "";
    count.textContent = index + 1 + " of " + frames.length;
  }

  frames.forEach(function (frame, frameIndex) {
    frame.addEventListener("click", function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      show(frameIndex);
      if (!dialog.open) dialog.showModal();
    });
  });

  dialog.querySelector("[data-prev]").addEventListener("click", function () {
    show(index - 1);
  });
  dialog.querySelector("[data-next]").addEventListener("click", function () {
    show(index + 1);
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  });

  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  if (!("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.removeAttribute("aria-current");
        });
        var current = links.find(function (link) {
          return link.getAttribute("href") === "#" + entry.target.id;
        });
        if (current) current.setAttribute("aria-current", "page");
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
  );

  links.forEach(function (link) {
    var section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  });
})();
