/*
 * Direct "Download PDF" for the resume.
 *
 * Renders the resume to a canvas with html2canvas, slices it into A4 pages
 * with jsPDF and triggers a download — no print dialog.
 *
 * The PDF uses the same layout as printing: every rule inside
 * `@media print { ... }` (style/print-resume.css) is re-applied to the
 * rendered copy, so print-resume.css stays the single place to tweak the
 * PDF look. The libraries live in /script/vendor and are only fetched the
 * first time someone clicks the button.
 */
(function () {
    'use strict';

    var LIBS = [
        '/script/vendor/html2canvas.min.js',
        '/script/vendor/jspdf.umd.min.js'
    ];
    var A4_WIDTH_MM = 210;
    var A4_HEIGHT_MM = 297;
    var PAGE_BG = '#1F1F1F';     // same as the print background
    var RENDER_SCALE = 2;        // 2x = sharp text without a huge file
    var EXPORT_CLASS = 'pdf-export';
    var RENDER_VIEWPORT = 1400;  // render with the desktop layout, even on phones
    // Sections that should sit vertically centered on the A4 page they land on.
    var CENTER_ON_PAGE = ['.bigger-container'];

    var libsPromise = null;

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('Could not load ' + src)); };
            document.head.appendChild(s);
        });
    }

    function loadLibs() {
        if (!libsPromise) {
            libsPromise = Promise.all(LIBS.map(loadScript)).catch(function (err) {
                libsPromise = null; // allow a retry
                throw err;
            });
        }
        return libsPromise;
    }

    /* Copy every @media print rule, scoped to html.pdf-export, so the
       rendered copy looks like the printed version. */
    function buildPrintCss() {
        var prefix = 'html.' + EXPORT_CLASS;
        var out = [];

        function scopeSelector(sel) {
            sel = sel.trim();
            if (/^(html|:root)\b/.test(sel)) return sel.replace(/^(html|:root)/, prefix);
            return prefix + ' ' + sel;
        }

        function collect(rules, inPrint) {
            for (var i = 0; i < rules.length; i++) {
                var r = rules[i];
                if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
                    try { collect(r.styleSheet.cssRules, inPrint); } catch (e) { /* cross-origin */ }
                } else if (r.type === CSSRule.MEDIA_RULE) {
                    var isPrint = /\bprint\b/i.test(r.media.mediaText);
                    if (isPrint || inPrint) collect(r.cssRules, true);
                } else if (inPrint && r.type === CSSRule.STYLE_RULE) {
                    var sel = r.selectorText.split(',').map(scopeSelector).join(', ');
                    out.push(sel + ' { ' + r.style.cssText + ' }');
                }
            }
        }

        for (var i = 0; i < document.styleSheets.length; i++) {
            try {
                collect(document.styleSheets[i].cssRules, false);
            } catch (e) {
                /* cross-origin sheet (e.g. icon font CDN) — not readable, skip */
            }
        }
        return out.join('\n');
    }

    function loadImage(src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    }

    /* Load an SVG rendered at exactly w x h pixels. Setting the size on the
       <svg> itself (instead of stretching the picture afterwards) lets the
       SVG keep its proportions and center itself, the way the browser shows it. */
    async function loadSvgAtSize(src, w, h) {
        var res = await fetch(src);
        if (!res.ok) throw new Error('Could not load ' + src);
        var svgDoc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
        var svg = svgDoc.documentElement;
        if (!svg || svg.nodeName.toLowerCase() !== 'svg') throw new Error('Not an SVG: ' + src);

        if (!svg.getAttribute('viewBox')) {
            var ow = parseFloat(svg.getAttribute('width'));
            var oh = parseFloat(svg.getAttribute('height'));
            if (ow > 0 && oh > 0) svg.setAttribute('viewBox', '0 0 ' + ow + ' ' + oh);
        }
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);

        var blob = new Blob([new XMLSerializer().serializeToString(svgDoc)], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        try {
            return await loadImage(url);
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    /* html2canvas has two blind spots that this resume hits:
       - SVGs without width/height attributes get cropped/stretched
       - CSS `filter` (invert, drop-shadow, ...) is ignored
       So those images are pre-drawn onto a canvas at their on-page size
       (with the filter applied) and swapped for a PNG before rendering. */
    async function flattenTrickyImages(doc, root) {
        var imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
        var view = doc.defaultView;

        await Promise.all(imgs.map(async function (img) {
            var src = img.currentSrc || img.src;
            if (!src) return;
            var cs = view.getComputedStyle(img);
            var isSvg = /\.svg(\?|#|$)/i.test(src);
            var filter = cs.filter && cs.filter !== 'none' ? cs.filter : '';
            if (!isSvg && !filter) return;

            var rect = img.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) return;

            try {
                var c = doc.createElement('canvas');
                c.width = Math.ceil(rect.width * RENDER_SCALE);
                c.height = Math.ceil(rect.height * RENDER_SCALE);
                var source = isSvg
                    ? await loadSvgAtSize(src, c.width, c.height)
                    : await loadImage(src);
                var ctx = c.getContext('2d');
                if (filter && 'filter' in ctx) ctx.filter = filter;
                ctx.drawImage(source, 0, 0, c.width, c.height);
                img.removeAttribute('srcset');
                img.src = c.toDataURL('image/png');
                img.style.filter = 'none';
            } catch (e) {
                /* leave the original image if it cannot be redrawn */
            }
        }));
    }

    /* html2canvas only draws standard bullets (disc, circle, decimal...).
       Custom string bullets such as `list-style: "✦"` are turned into a
       real element sitting where the marker would be. */
    function materializeStringBullets(doc, root) {
        var view = doc.defaultView;
        root.querySelectorAll('li').forEach(function (li) {
            var cs = view.getComputedStyle(li);
            var m = /^\s*(["'])(.*)\1\s*$/.exec(cs.listStyleType || '');
            if (!m || cs.display === 'none') return;

            var bullet = doc.createElement('span');
            bullet.textContent = m[2];
            bullet.setAttribute('aria-hidden', 'true');
            bullet.style.cssText = 'position:absolute; right:100%; top:0; white-space:pre;';
            if (cs.position === 'static') li.style.position = 'relative';
            li.style.listStyle = 'none';
            li.insertBefore(bullet, li.firstChild);
        });
    }

    /* Push each CENTER_ON_PAGE section down so it is vertically centered on
       the A4 page where it starts, and make the layout tall enough to fill
       that page. */
    function centerSectionsOnPages(doc, root) {
        var rootTop = root.getBoundingClientRect().top;
        var pageH = root.getBoundingClientRect().width * A4_HEIGHT_MM / A4_WIDTH_MM;
        var view = doc.defaultView;

        CENTER_ON_PAGE.forEach(function (selector) {
            root.querySelectorAll(selector).forEach(function (el) {
                var box = el.getBoundingClientRect();
                if (box.height < 1 || box.height > pageH) return;

                var top = box.top - rootTop;
                // Small tolerance: a section starting a few px into a page belongs to it.
                var page = Math.floor((top + 5) / pageH);
                var targetTop = page * pageH + (pageH - box.height) / 2;
                var shift = targetTop - top;
                if (shift <= 0) return;

                var mt = parseFloat(view.getComputedStyle(el).marginTop) || 0;
                el.style.marginTop = (mt + shift) + 'px';

                // Fill the rest of that page below the card with page background
                // (extra bottom margin, so the rest of the layout doesn't move).
                var missing = (page + 1) * pageH - root.getBoundingClientRect().height;
                if (missing > 0) {
                    var mb = parseFloat(view.getComputedStyle(el).marginBottom) || 0;
                    el.style.marginBottom = (mb + missing) + 'px';
                }
            });
        });
    }

    function fileName(resumeEl) {
        var nameEl = resumeEl.querySelector('.name');
        var name = nameEl ? nameEl.textContent.trim() : 'Resume';
        return name.replace(/\s+/g, '-') + '-CV.pdf';
    }

    async function generate(resumeEl) {
        await loadLibs();
        if (document.fonts && document.fonts.ready) await document.fonts.ready;

        var printCss = buildPrintCss();
        var links = [];
        var layout = { width: 0, height: 0 };

        // html2canvas renders a copy of the page; scrolling to the top
        // avoids an offset/cropped capture.
        var prevScroll = window.scrollY;
        window.scrollTo(0, 0);

        var canvas;
        try {
            canvas = await window.html2canvas(resumeEl, {
                scale: RENDER_SCALE,
                useCORS: true,
                backgroundColor: PAGE_BG,
                logging: false,
                windowWidth: RENDER_VIEWPORT,
                windowHeight: 900,
                onclone: function (doc, clonedEl) {
                    doc.documentElement.classList.add(EXPORT_CLASS);
                    var style = doc.createElement('style');
                    style.textContent = printCss;
                    doc.head.appendChild(style);

                    materializeStringBullets(doc, clonedEl);
                    centerSectionsOnPages(doc, clonedEl);

                    // Measure the print layout and remember where the links are
                    // so they can stay clickable in the PDF.
                    var box = clonedEl.getBoundingClientRect();
                    layout.width = box.width;
                    layout.height = box.height;
                    clonedEl.querySelectorAll('a[href]').forEach(function (a) {
                        var href = a.getAttribute('href').trim();
                        if (!/^(https?:|mailto:|tel:)/i.test(href)) return;
                        Array.prototype.forEach.call(a.getClientRects(), function (r) {
                            if (r.width < 1 || r.height < 1) return;
                            links.push({
                                url: href.replace(/^mailto:\s+/i, 'mailto:'),
                                x: r.left - box.left,
                                y: r.top - box.top,
                                w: r.width,
                                h: r.height
                            });
                        });
                    });

                    return flattenTrickyImages(doc, clonedEl);
                }
            });
        } finally {
            window.scrollTo(0, prevScroll);
        }

        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

        var cssWidth = layout.width || canvas.width / RENDER_SCALE;
        var mmPerPx = A4_WIDTH_MM / cssWidth;                    // CSS px -> mm
        var pageHeightPx = A4_HEIGHT_MM / mmPerPx;              // one A4 page, in CSS px
        var totalHeightPx = canvas.height / (canvas.width / cssWidth);
        // Ignore a tiny overflow (< 2% of a page) instead of adding a blank page.
        var pageCount = Math.max(1, Math.ceil(totalHeightPx / pageHeightPx - 0.02));

        var canvasPxPerCss = canvas.width / cssWidth;
        var slice = document.createElement('canvas');
        slice.width = canvas.width;
        var sliceCtx = slice.getContext('2d');

        for (var p = 0; p < pageCount; p++) {
            var srcY = Math.round(p * pageHeightPx * canvasPxPerCss);
            var srcH = Math.min(Math.round(pageHeightPx * canvasPxPerCss), canvas.height - srcY);
            if (srcH <= 0) break;

            slice.height = srcH;
            sliceCtx.fillStyle = PAGE_BG;
            sliceCtx.fillRect(0, 0, slice.width, srcH);
            sliceCtx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

            if (p > 0) pdf.addPage();
            pdf.setFillColor(PAGE_BG);
            pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, 'F');
            pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG',
                0, 0, A4_WIDTH_MM, (srcH / canvasPxPerCss) * mmPerPx, undefined, 'FAST');
        }

        links.forEach(function (l) {
            var page = Math.floor(l.y / pageHeightPx);
            if (page >= pageCount) return;
            pdf.setPage(page + 1);
            pdf.link(l.x * mmPerPx, (l.y - page * pageHeightPx) * mmPerPx,
                l.w * mmPerPx, l.h * mmPerPx, { url: l.url });
        });

        pdf.setProperties({ title: fileName(resumeEl).replace(/\.pdf$/, '').replace(/-/g, ' ') });
        pdf.save(fileName(resumeEl));
    }

    var busy = false;

    window.downloadResumePdf = async function (button) {
        if (busy) return;
        var resumeEl = document.querySelector('.resume-body, .resume-body-hidden');
        if (!resumeEl) return;

        busy = true;
        var originalText = button ? button.textContent : '';
        if (button) {
            button.disabled = true;
            button.textContent = 'Generating PDF…';
        }

        try {
            await generate(resumeEl);
        } catch (err) {
            console.error('PDF generation failed, falling back to print:', err);
            window.print();
        } finally {
            busy = false;
            if (button) {
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    };

    // Start fetching the libraries as soon as someone hovers the button.
    document.addEventListener('pointerover', function (e) {
        if (e.target.closest && e.target.closest('[data-pdf-download]')) loadLibs().catch(function () {});
    }, { passive: true });
})();
