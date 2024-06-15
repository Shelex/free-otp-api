# otp.shelex.dev

Get list of phone numbers and specific sms for specific phone number to use in tests which involve a lot of otp codes.

<a href="https://otp-api.shelex.dev/docs"><img src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SW-logo-clr.png" height="50"></a>

## Description

- basically, it is a puppeteer instance that parses specific pages when requested and api on top of it.
- each request will spawn a new anonymous page, up to 15 pages.
- every 10 minutes browser is closed to avoid memory issues with long-living browser window.
- phone numbers are cached with redis to avoid refetching each time.
- a regular job is triggered to refresh the cache.
- supports free sms testing services:
  - [receive-sms-free.cc](https://receive-sms-free.cc/)
  - [anonymsms.com](https://anonymsms.com/)
  - [quackr.io](https://quackr.io/temporary-numbers)
  - [smstome.com](https://smstome.com/)
  - [receivesms.co](https://www.receivesms.co/)
  - [receiveasmsonline.com](https://receiveasmsonline.com/)
  - [receive-smss-online.com](https://www.receive-smss-online.com/)

## API

API has `https://otp-api.shelex.dev/api/` baseUrl.  

- get list of countries available:
  ```bash
      GET https://otp-api.shelex.dev/api/countries
  ```
- get list of phone numbers per country:
  ```bash
      GET https://otp-api.shelex.dev/api/list/{{country}}
  ```
- get otp code:
  ```
      GET https://otp-api.shelex.dev/api/{{country}}/{{phone}}?match={{substring}}&ago={{ago}}
  ```
  - `country` is a country name - USA, UK, Ukraine, Canada, Moldova, Spain... full list in [docs](https://otp-api.shelex.dev/docs/static/index.html) in "available values" section. Basically is a union of all supported countries across services.
  - `phone` - is a phone number as it is specified in url, 10-13 digits, without "+" sign
  - `match` (optional) - substring to look for in the sms
  - `ago` (optional, `30s` by default) - the max time ago to look for specific sms, units are `s` - secons, `m` - minutes, `h` - hours, for example: `10s`, `5m`, `1h`, etc. Will be converted to timestamp.
  - `since` (optional) - instead of `ago` string exact timestamp could be specified.
  - `source` (optional) - specify service which provide phone number, uses `receive-sms-free.cc` by default.
  - recursively queries the first page of latest phone number messages and matches sms by `match` substring or `ago`/`since` query parameter, refreshing page every 5 seconds.
  - returns sms that matches provided inputs and tries to parse otp code..
