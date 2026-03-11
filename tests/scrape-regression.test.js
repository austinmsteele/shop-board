import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __testOnlyParseJsonLd,
  __testOnlyPickBestProductPrice,
  __testOnlyPickCompactItemName,
  __testOnlyPickFinalItemName,
  __testOnlyExtractFromHtml
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
