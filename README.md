# Free otp code api

Get list of phone numbers and specific sms for specific phone number to use in tests which involve a lot of otp codes.


<a href="https://otp.shelex.dev/docs"><img src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SW-logo-clr.png" height="50"></a>

## Description

- supports `receive-sms-free.cc` free otp code provider for now
- get otp code: `GET https://otp.shelex.dev/{{country}}/{{phone}}?match={{substring}}&ago={{ago}}`
    - country is a country name - USA, UK, Ukraine, Canada, Moldova, Spain... full list is on [receive-sms-free](https://receive-sms-free.cc/regions/) countries website, if specific country page is opened, the name is in url path, example: `Free-Netherlands-Phone-Number` -> `Netherlands`
    - phone - is a phone number as it is specified in url, 10-13 digits
    - match (optional) - substring to look for in the sms
    - ago (optional, `30s` by default) - the max time ago to look for specific sms, units are `s` - secons, `m` - minutes, `h` - hours, for example: `10s`, `5m`, `1h`, etc.
    - recursively searches phone number page for latest sms by `match` substring or `ago` query parameter, refreshing page every 3 sec
    - returns sms that matches provided inputs and tries to parse otp code.
- get list of phone numbers per country: `GET https://otp.shelex.dev/list/{{country}}`
- has browser instance running on demand
- each request will spawn a page in the browser, up to 15 pages.
- every 10 minutes browser is closed to avoid memory issues with long-living browser.

## Examples

Swagger is available at https://otp.shelex.dev/docs

- successful response for `GET https://otp.shelex.dev/USA/19137886215?match=Amazon&ago=1h`:
    ```json
    {
        "requested": {
            "country": "USA",
            "phoneNumber": "19137886215",
            "ago": 1684535236008,
            "agoText": "1h",
            "match": "Amazon",
            "url": "https://receive-sms-free.cc/Free-USA-Phone-Number/19137886215/"
        },
        "result": {
            "ago": 1684535779458,
            "agoText": "51 mins ago",
            "message": "Amazon: Your code is 228438. Don't share it. If you didn't request it, deny here https://amazon.com/a/c/r/lnqyxK8ckySBXJNgvdp014rIO",
            "otp": "228438"
        }
    }
    ```
- failed response for `GET https://otp.shelex.dev/USA/1913788621500?match=Amazon&ago=1h`
    ```json
    {
        "requested": {
            "country": "USA",
            "phoneNumber": "1913788621500",
            "ago": 1684535322725,
            "agoText": "1h",
            "match": "Amazon",
            "url": "https://receive-sms-free.cc/Free-USA-Phone-Number/1913788621500/"
        },
        "error": "number returned 404"
    }
    ```

- failed response for `GET https://otp.shelex.dev/UNKNOWN/19137886215?match=Amazon&ago=1h`:
    ```json
    {
        "statusCode": 400,
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "params/country must be equal to one of the allowed values"
    }
    ```

- successful response for `GET https://otp.shelex.dev/list/Ukraine`:
    ```json
    {
        "phones": [
            "+380 970778327",
            "+380 972568073",
            "+380 966218950"
        ]
    }
    ```

## Tooling

- `puppeteer-cluster` for handling puppeteer instance, pages and consume tasks
- `puppeteer-extra` + plugins is used to bypass cloudflare protection
- `fastify` as web framework
-  `@fastify/swagger` and `@fastify/swagger-ui` for api playground
- locking mechanism for creating browser instance to avoid spawning multiple browsers when race condition appears
- mechanism to close the puppeteer page when request is aborted to avoid background running tasks in puppeteer
- systemd process that handles running and restarting app, nginx as reverse-proxy, certbot for handling ssl.

## Links
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra)
- [puppeteer-cluster](https://github.com/thomasdondorf/puppeteer-cluster)
- [fastify](https://www.fastify.io/docs/latest/)
- running node api with systemd: [Node.js App With Systemd](https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/)
- nginx as reverse proxy for nodejs api: [use Nginx for a Node.js server](https://blog.logrocket.com/how-to-run-a-node-js-server-with-nginx/)
- nginx + certbot = <3 [Secure Nginx with Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04)
- if puppeteer refuses to start chromium there is a huge list of dependencies to install: [Chrome doesn't launch on Linux](https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux)
