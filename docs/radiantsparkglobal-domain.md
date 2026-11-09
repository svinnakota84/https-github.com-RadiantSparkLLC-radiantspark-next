# radiantsparkglobal.com

Requested domain: radiantsparkglobal.com
Website source: svinnakota84/radiantspark
Current working address: https://svinnakota84.github.io/radiantspark/

## Current status (2026-11-07)

Public DNS A and NS lookups returned NXDOMAIN. The .com registry RDAP lookup returned HTTP 404 (no registration record). The domain therefore appears unregistered; this is not a registrar price or purchase guarantee. No domain has been purchased and no DNS records have been changed.

## Prepared configuration

Branch domain/radiantsparkglobal-com contains public/CNAME with radiantsparkglobal.com. Keep the default GitHub Pages address active until domain ownership/control is established. A CNAME file alone does not configure an Actions-based Pages custom domain: the repository's Pages setting must also specify the custom domain.

After registration and ownership verification, set radiantsparkglobal.com in GitHub Settings > Pages, then configure the following web DNS records at the authoritative DNS host (Zoho if using Zoho's nameservers):

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | svinnakota84.github.io |

Use the DNS provider's default TTL. Preserve mail MX, SPF, DKIM and DMARC records. Remove only conflicting web records after reviewing them. Do not use wildcard records. Add the exact domain-verification TXT value supplied by GitHub if prompted; no placeholder verification token should be published. Once DNS and the GitHub TLS certificate validate, enable HTTPS and verify both apex and www URLs. Merge the prepared branch when the domain is activated.

Official instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Domain registration is a separate paid service from GitHub hosting. Registration and any renewal price require the owner's approval before purchase.
