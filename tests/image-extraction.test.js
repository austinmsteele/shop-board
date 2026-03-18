import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __testOnlyCollectImageCandidatesFromHtml,
  __testOnlyExtractFromHtml,
  __testOnlyIsLikelyBlockedFallbackContent,
  __testOnlyShouldRejectSparseRetailerProduct
} from '../server.js';

test('collectImageCandidatesFromHtml extracts product images from Home Depot-style script payloads', () => {
  const baseUrl = 'https://www.homedepot.com/p/example-product/123456789';
  const html = `
    <html>
      <head>
        <script>
          window.__PDP_STATE__ = {
            "media": {
              "mainImage": "https:\\/\\/images.thdstatic.com\\/productImages\\/abc-main.jpg",
              "gallery": [
                { "url": "https:\\/\\/images.thdstatic.com\\/productImages\\/abc-alt-1.jpg?wid=1000&hei=1000" },
                { "url": "https:\\/\\/images.thdstatic.com\\/productImages\\/abc-alt-2.jpg?wid=1200&hei=1200" }
              ]
            }
          };
        </script>
      </head>
      <body></body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.ok(images.some((url) => url.includes('images.thdstatic.com/productImages/abc-main.jpg')));
  assert.ok(images.some((url) => url.includes('images.thdstatic.com/productImages/abc-alt-1.jpg')));
});

test('collectImageCandidatesFromHtml keeps low-res image when it is the only image available', () => {
  const baseUrl = 'https://www.homedepot.com/p/example-product/123456789';
  const imageUrl = 'https://images.thdstatic.com/productImages/only-image-300x300.jpg';
  const html = `
    <html>
      <head>
        <meta property="og:image" content="${imageUrl}" />
      </head>
      <body></body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, { 'og:image': imageUrl }, {});
  assert.ok(images.length >= 1);
  assert.equal(images[0], imageUrl);
});

test('extractFromHtml returns image without throwing when only metadata image is present', async () => {
  const url = 'https://store.example.com/p/demo-flush-mount';
  const imageUrl = 'https://cdn.example.invalid/images/demo-flush-mount.jpg';
  const html = `
    <html>
      <head>
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:title" content="Demo Flush Mount" />
      </head>
      <body>
        <h1>Demo Flush Mount</h1>
      </body>
    </html>
  `;

  const product = await __testOnlyExtractFromHtml(url, html);
  assert.equal(product.image, imageUrl);
  assert.ok(Array.isArray(product.images));
  assert.ok(product.images.includes(imageUrl));
});

test('collectImageCandidatesFromHtml captures multiple Home Depot thdstatic gallery URLs', () => {
  const baseUrl = 'https://www.homedepot.com/p/demo-product/123456789';
  const html = `
    <html>
      <head>
        <script>
          window.__PDP__ = {
            "images": [
              "https:\\/\\/images.thdstatic.com\\/productImages\\/gallery-01_1000.jpg",
              "https:\\/\\/images.thdstatic.com\\/productImages\\/gallery-02_1000.jpg",
              "https:\\/\\/images.thdstatic.com\\/productImages\\/gallery-03_1000.jpg",
              "//images.thdstatic.com/productImages/gallery-04_1000.jpg",
              "https://images.thdstatic.com/productImages/gallery-05_1000.jpg?wid=600&hei=600"
            ]
          };
        </script>
      </head>
      <body></body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.ok(images.length >= 5);
  assert.ok(images.some((url) => url.includes('gallery-01_1000.jpg')));
  assert.ok(images.some((url) => url.includes('gallery-05_1000.jpg')));
});

test('dedupe keeps low-res gallery images when they are distinct and high-res is sparse', () => {
  const baseUrl = 'https://www.homedepot.com/p/demo-product/123456789';
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://images.thdstatic.com/productImages/hero_1000.jpg" />
      </head>
      <body>
        <img src="https://images.thdstatic.com/productImages/detail-1_300.jpg" />
        <img src="https://images.thdstatic.com/productImages/detail-2_300.jpg" />
        <img src="https://images.thdstatic.com/productImages/detail-3_300.jpg" />
        <img src="https://images.thdstatic.com/productImages/detail-4_300.jpg" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.ok(images.length >= 4);
  assert.ok(images.some((url) => url.includes('hero_1000.jpg')));
  assert.ok(images.some((url) => url.includes('detail-4_300.jpg')));
});

test('blocked fallback detector flags Home Depot 403 error content', () => {
  const payload = `
    Title: Error Page
    Warning: Target URL returned error 403: Forbidden
    Markdown Content: How doers get more done
  `;
  assert.equal(__testOnlyIsLikelyBlockedFallbackContent(payload), true);
  assert.equal(__testOnlyIsLikelyBlockedFallbackContent('Valid product details with dimensions and materials.'), false);
});

test('sparse Home Depot product is rejected when both image and price are missing', () => {
  const reject = __testOnlyShouldRejectSparseRetailerProduct(
    { image: '', images: [], price: '' },
    'https://www.homedepot.com/p/demo-product/123'
  );
  assert.equal(reject, true);

  const keep = __testOnlyShouldRejectSparseRetailerProduct(
    { image: 'https://images.thdstatic.com/productImages/a.jpg', images: [], price: '' },
    'https://www.homedepot.com/p/demo-product/123'
  );
  assert.equal(keep, false);
});

test('looksLikeProductImage excludes Home Depot payment/contentgrid assets', () => {
  const baseUrl = 'https://www.homedepot.com/p/demo-product/123';
  const html = `
    <html>
      <body>
        <img src="https://assets.thdstatic.com/images/v1/payment-credit-card-thd.png" />
        <img src="https://contentgrid.thdstatic.com/hdus/en_US/DTCCOMNEW/fetch/ChristmasDelivery-Tools-Split-Dsk2.jpg" />
        <img src="https://images.thdstatic.com/productImages/valid-product-image-64_1000.jpg" />
      </body>
    </html>
  `;
  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.equal(images.length, 1);
  assert.ok(images[0].includes('images.thdstatic.com/productImages/valid-product-image-64_1000.jpg'));
});

test('collectImageCandidatesFromHtml excludes B&H oldIEMessage browser icon assets', () => {
  const baseUrl = 'https://www.bhphotovideo.com/c/product/1725678-REG/amaran_apa0235a31_cob_200x_s_bi_color.html';
  const html = `
    <html>
      <body>
        <img src="https://www.bhphotovideo.com/images/oldIEMessage/chrome.jpg" />
        <img src="https://www.bhphotovideo.com/images/oldIEMessage/safari.jpg" />
        <img src="https://www.bhphotovideo.com/images/oldIEMessage/firefox.jpg" />
        <img src="https://www.bhphotovideo.com/images/oldIEMessage/microsoft-edge.png" />
        <img src="https://www.bhphotovideo.com/images/images500x500/amaran_demo_1725678.jpg" />
      </body>
    </html>
  `;
  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.equal(images.length, 1);
  assert.ok(images[0].includes('images500x500/amaran_demo_1725678.jpg'));
});

test('collectImageCandidatesFromHtml derives B&H fallback image from product URL when page has no valid images', () => {
  const baseUrl = 'https://www.bhphotovideo.com/c/product/1753990-REG/amaran_apm022xa10_amaran_cob_200x_s.html';
  const html = '<html><body></body></html>';
  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.ok(images.length >= 1);
  assert.equal(
    images[0],
    'https://www.bhphotovideo.com/images/fb/amaran_apm022xa10_amaran_cob_200x_s_1753990.jpg'
  );
});

test('collectImageCandidatesFromHtml prefers IKEA product-matching gallery images over unrelated recommendation images', () => {
  const baseUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl" />
      </head>
      <body>
        <img src="https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl" />
        <img src="https://www.ikea.com/us/en/images/products/fake-table-black__1234567_pe222222_s5.jpg?f=xl" />
        <img src="https://www.ikea.com/us/en/images/products/fake-table-black__1234568_pe333333_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.equal(images.length, 2);
  assert.ok(images.every((url) => url.includes('/images/products/fake-table-black__')));
});

test('collectImageCandidatesFromHtml keeps only the strongest IKEA slug matches when weaker similar table images exist', () => {
  const baseUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <body>
        <img src="https://www.ikea.com/us/en/images/products/fake-table-black__1234567_pe222222_s5.jpg?f=xl" />
        <img src="https://www.ikea.com/us/en/images/products/fake-table-black__1234568_pe333333_s5.jpg?f=xl" />
        <img src="https://www.ikea.com/us/en/images/products/round-table-black__999999_pe444444_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.equal(images.length, 2);
  assert.ok(images.every((url) => url.includes('/images/products/fake-table-black__')));
});

test('collectImageCandidatesFromHtml for IKEA excludes non-matching room-scene images when no product match exists', () => {
  const baseUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <body>
        <img src="https://www.ikea.com/us/en/images/products/room-scene-table__999999_pe111111_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.deepEqual(images, []);
});

test('collectImageCandidatesFromHtml for IKEA rejects weak token-only image matches', () => {
  const baseUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <body>
        <div class="pipf-page js-product-pip"></div>
        <img src="https://www.ikea.com/us/en/images/products/modern-table-black__999999_pe111111_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, {});
  assert.deepEqual(images, []);
});

test('collectImageCandidatesFromHtml for IKEA prefers product JSON-LD images over unrelated DOM/script images', () => {
  const baseUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <body>
        <img src="https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl" />
        <script>
          window.__ANY__ = {"media":[
            "https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl"
          ]};
        </script>
      </body>
    </html>
  `;

  const jsonLd = {
    image: 'https://www.ikea.com/us/en/images/products/fake-table-black__1234567_pe222222_s5.jpg?f=xl',
    images: [
      'https://www.ikea.com/us/en/images/products/fake-table-black__1234568_pe333333_s5.jpg?f=xl'
    ]
  };
  const images = __testOnlyCollectImageCandidatesFromHtml(baseUrl, html, {}, jsonLd);
  assert.equal(images.length, 2);
  assert.ok(images.every((url) => url.includes('/images/products/fake-table-black__')));
});
