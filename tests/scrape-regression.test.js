import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __testOnlyParseJsonLd,
  __testOnlyPickBestProductPrice,
  __testOnlyCollectImageCandidatesFromHtml,
  __testOnlyPickCompactItemName,
  __testOnlyPickFinalItemName,
  __testOnlyExtractFromHtml,
  __testOnlyMergeProducts
} from '../server.js';

test('json-ld parser selects product candidate that matches URL context', () => {
  const sourceUrl = 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html?piid=578644967';
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: 'Somerset Dining Table',
        url: 'https://www.wayfair.com/furniture/pdp/somerset-dining-table-w000111222.html',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '150.00'
        }
      },
      {
        '@type': 'Product',
        name: 'Armande Linen LED Flush Mount',
        url: 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '139.00'
        }
      }
    ]
  };
  const html = `<html><head><script type="application/ld+json">${JSON.stringify(payload)}</script></head></html>`;
  const parsed = __testOnlyParseJsonLd(html, {
    sourceUrl,
    pageTitle: 'Armande Linen LED Flush Mount'
  });
  assert.match(parsed.name, /armande/i);
  assert.match(String(parsed.price), /139/);
});

test('price picker prefers current product price over list/installment amounts', () => {
  const sourceUrl = 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html?piid=578644967';
  const html = `
    <html>
      <head>
        <meta property="product:price:currency" content="USD" />
        <meta property="product:price:amount" content="150.00" />
      </head>
      <body>
        <div class="price-block">
          <span>Price now $139.00</span>
          <span class="was-price">Was $148.49</span>
          <span>or $35 in 4 payments</span>
          <span>Earn $6.95 in rewards</span>
        </div>
        <script>
          window.__PRICE__ = {"regularPrice":"150.00","currentPrice":"139.00"};
        </script>
      </body>
    </html>
  `;
  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$139.00');
});

test('IKEA price picker prefers the main product price over later recommendation prices', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <body>
        <main>
          <h1>Fake Table Black</h1>
          <section class="hero">
            <span>Price</span>
            <span>$249.00</span>
          </section>
          <div>Article Number 123.456.78</div>
          <section class="recommendations">
            <span>More options</span>
            <span>$39.99</span>
            <span>$59.99</span>
          </section>
        </main>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$249.00');
});

test('IKEA price picker prefers Product JSON-LD offer price over mixed page prices', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Product","name":"Fake Table Black","offers":{"@type":"Offer","price":"249.00","priceCurrency":"USD","url":"${sourceUrl}"}}
        </script>
      </head>
      <body>
        <span>$39.99</span>
        <span>$59.99</span>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$249.00');
});

test('IKEA price picker maps utag arrays to the matching URL article number', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/lack-coffee-table-black-brown-40104294/';
  const html = `
    <html>
      <body>
        <script type="text/javascript" data-type="utag-data">
          var utag_data = {
            "product_ids": ["11111111", "40104294"],
            "product_prices": ["10.00", "29.99"]
          };
        </script>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$29.99');
});

test('IKEA price picker prefers data-product-price over JSON-LD when both are present', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-12345678/';
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Product","name":"Fake Table Black","offers":{"@type":"Offer","price":"249.00","priceCurrency":"USD","url":"${sourceUrl}"}}
        </script>
      </head>
      <body>
        <div class="pipf-page js-product-pip" data-product-no="12345678" data-product-price="59.99"></div>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$59.99');
});

test('IKEA price picker reads data-product-price when attribute order is price then product-no', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-12345678/';
  const html = `
    <html>
      <body>
        <div class="pipf-page js-product-pip" data-product-price="59.99" data-product-no="12345678"></div>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$59.99');
});

test('IKEA price picker chooses matching data-product-price when multiple product blocks exist', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-12345678/';
  const html = `
    <html>
      <body>
        <div class="pipf-page js-product-pip" data-product-no="99999999" data-product-price="249.00"></div>
        <div class="pipf-page js-product-pip" data-product-no="12345678" data-product-price="59.99"></div>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '$59.99');
});

test('IKEA price picker ignores non-product category pages with generic teaser prices', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/cat/products-products/';
  const html = `
    <html>
      <head><title>Products - IKEA</title></head>
      <body>
        <script type="text/javascript" data-type="utag-data">
          var utag_data = {
            "product_ids": ["99999999"],
            "product_prices": ["10.00"]
          };
        </script>
        <span>$10.00</span>
        <span>$29.99</span>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '');
});

test('IKEA image collector ignores non-product category pages', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/cat/products-products/';
  const html = `
    <html>
      <body>
        <img src="https://www.ikea.com/ext/ingkadam/m/4ab955a85bb2bde6/original/PH209119.jpg?imwidth=400" />
        <img src="https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(sourceUrl, html, {}, {});
  assert.deepEqual(images, []);
});

test('IKEA product-path URL does not emit teaser price when page content is non-product', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <head>
        <title>Products - IKEA</title>
      </head>
      <body>
        <span>$10.00</span>
        <script type="text/javascript" data-type="utag-data">
          var utag_data = {"product_ids":["99999999"],"product_prices":["10.00"]};
        </script>
      </body>
    </html>
  `;

  const price = __testOnlyPickBestProductPrice(sourceUrl, html);
  assert.equal(price, '');
});

test('IKEA product-path URL does not emit non-product gallery images when content is category-like', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const html = `
    <html>
      <head>
        <title>Products - IKEA</title>
      </head>
      <body>
        <img src="https://www.ikea.com/ext/ingkadam/m/4ab955a85bb2bde6/original/PH209119.jpg?imwidth=400" />
        <img src="https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl" />
      </body>
    </html>
  `;

  const images = __testOnlyCollectImageCandidatesFromHtml(sourceUrl, html, {}, {});
  assert.deepEqual(images, []);
});

test('IKEA merge ignores fallback candidates whose product name does not match the URL identity', () => {
  const sourceUrl = 'https://www.ikea.com/us/en/p/fake-table-black-s12345678/';
  const merged = __testOnlyMergeProducts(
    {
      name: 'Fake Table Black',
      productTitleRaw: 'Fake Table Black',
      image: 'https://www.ikea.com/us/en/images/products/fake-table-black__1234567_pe222222_s5.jpg?f=xl',
      images: ['https://www.ikea.com/us/en/images/products/fake-table-black__1234567_pe222222_s5.jpg?f=xl'],
      price: '$249.00'
    },
    {
      name: 'Other Table Oak',
      productTitleRaw: 'Other Table Oak',
      image: 'https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl',
      images: ['https://www.ikea.com/us/en/images/products/other-table-oak__999999_pe111111_s5.jpg?f=xl'],
      price: '$39.99'
    },
    sourceUrl
  );

  assert.equal(merged.price, '$249.00');
  assert.ok(String(merged.image || '').includes('/images/products/fake-table-black__'));
  assert.equal(Array.isArray(merged.images) ? merged.images.length : 0, 1);
});

test('compact item name falls back to URL model token when extracted name is generic', async () => {
  const sourceUrl = 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html?piid=578644967';
  const output = await __testOnlyPickCompactItemName(
    {
      name: 'Table',
      brand: '',
      seller: 'wayfair.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Armande');
});

test('final item name keeps strong full product title for extraction output', async () => {
  const sourceUrl = 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html?piid=578644967';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Armande Linen LED Flush Mount',
      brand: 'Joss & Main',
      seller: 'wayfair.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Armande by Joss & Main');
});

test('final item name upgrades generic types to cleaned URL title', async () => {
  const sourceUrl = 'https://www.wayfair.com/home/pdp/joss-main-armande-1-light-15-led-flush-mount-w005061385.html?piid=578644967';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Light Fixture',
      brand: 'Joss & Main',
      seller: 'wayfair.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Armande by Joss & Main');
});

test('final item name preserves strong full title for non-wayfair sellers', async () => {
  const sourceUrl = 'https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-559LF-BLMPU/321135508';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Trinsic Single-Hole Single-Handle Bathroom Faucet in Matte Black',
      brand: 'Delta',
      seller: 'homedepot.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Trinsic Faucet by Delta');
});

test('final item name can infer brand from prefixed title on multi-brand seller', async () => {
  const sourceUrl = 'https://www.wayfair.com/lighting/pdp/wade-logan-addae-157-in-3-light-indoor-flush-mount-w000801497.html';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Wade Logan Addae 157 In 3 Light Indoor Flush Mount',
      brand: '',
      seller: 'wayfair.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Addae by Wade Logan');
});

test('final item name applies universal by-brand format for non-listed seller domains', async () => {
  const sourceUrl = 'https://lighting.example.com/products/colinet-faucet';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Colinet Faucet',
      brand: 'Moen',
      seller: 'lighting.example.com',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.equal(output, 'Colinet Faucet by Moen');
});

test('amazon extraction prefers product title element over noisy heading text', async () => {
  const sourceUrl = 'https://www.amazon.com/Eezy-Peezy-Climber-Top/dp/B012345678';
  const html = `
    <html>
      <head>
        <title>Ref=Sr by No Release date March 5 : Toys & Games</title>
        <meta property="og:title" content="Ref=Sr by No Release date March 5" />
      </head>
      <body>
        <h1>Ref=Sr by No Release date March 5</h1>
        <span id="productTitle">Eezy Peezy Climber with Top - Active Indoor Outdoor Play Set</span>
      </body>
    </html>
  `;
  const product = await __testOnlyExtractFromHtml(sourceUrl, html);
  assert.equal(product.name, 'Eezy Peezy Climber with Top');
  assert.doesNotMatch(product.name, /ref\s*=/i);
});

test('amazon fallback name rejects nonsense title fragments', async () => {
  const sourceUrl = 'https://www.amazon.com/Eezy-Peezy-Climber-Top-Active-Indoor-Outdoor-Play-Set/dp/B012345678/ref=sr_1_1';
  const output = await __testOnlyPickFinalItemName(
    {
      name: 'Ref=Sr by No Release date March 5',
      seller: 'amazon.com',
      brand: '',
      description: '',
      specs: [],
      highlights: []
    },
    sourceUrl
  );
  assert.match(output, /eezy/i);
  assert.match(output, /climber/i);
  assert.doesNotMatch(output, /ref\s*=/i);
});
