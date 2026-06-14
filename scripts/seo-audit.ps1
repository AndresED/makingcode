$urls = @(
  @{ Name = 'home'; Url = 'https://www.makingcode.dev/' },
  @{ Name = 'blog'; Url = 'https://www.makingcode.dev/blog' },
  @{ Name = 'blog_search'; Url = 'https://www.makingcode.dev/blog?q=nestjs' },
  @{ Name = 'sitemap'; Url = 'https://www.makingcode.dev/sitemap.xml' },
  @{ Name = 'robots'; Url = 'https://www.makingcode.dev/robots.txt' },
  @{ Name = 'apex'; Url = 'https://makingcode.dev/' },
  @{ Name = 'post_en'; Url = 'https://www.makingcode.dev/blog/multitenancy-nestjs-tutorial' },
  @{ Name = 'post_es'; Url = 'https://www.makingcode.dev/blog/como-construir-una-aplicacion-saas-multi-tenant-en-nestjs-sin-duplicar-tu-codigo' },
  @{ Name = 'series'; Url = 'https://www.makingcode.dev/series/nestjs-enterprise' },
  @{ Name = 'login'; Url = 'https://www.makingcode.dev/login' }
)

foreach ($item in $urls) {
  try {
    $resp = Invoke-WebRequest -Uri $item.Url -UseBasicParsing -MaximumRedirection 5
    $html = $resp.Content
    $title = 'n/a'
    if ($html -match '<title>([^<]+)</title>') { $title = $Matches[1] }
    $robots = 'n/a'
    if ($html -match '<meta[^>]+name="robots"[^>]+content="([^"]+)"') { $robots = $Matches[1] }
    $canonical = 'n/a'
    if ($html -match '<link[^>]+rel="canonical"[^>]+href="([^"]+)"') { $canonical = $Matches[1] }
    $lang = 'n/a'
    if ($html -match '<html[^>]+lang="([^"]+)"') { $lang = $Matches[1] }
    $jsonld = ([regex]::Matches($html, 'application/ld\+json')).Count
    Write-Output ("{0}|{1}|{2}|title={3}|robots={4}|canonical={5}|lang={6}|jsonld={7}" -f $item.Name, $resp.StatusCode, $resp.BaseResponse.ResponseUri, $title, $robots, $canonical, $lang, $jsonld)
  }
  catch {
    $code = 'ERR'
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    Write-Output ("{0}|{1}|ERR|{2}" -f $item.Name, $code, $_.Exception.Message)
  }
}

Write-Output '---SITEMAP---'
$sitemap = (Invoke-WebRequest 'https://www.makingcode.dev/sitemap.xml' -UseBasicParsing).Content
Write-Output ('loc_count=' + ([regex]::Matches($sitemap, '<loc>')).Count)
[regex]::Matches($sitemap, '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value } | Select-Object -First 15

Write-Output '---POST_ES_SIGNALS---'
$postHtml = (Invoke-WebRequest 'https://www.makingcode.dev/blog/como-construir-una-aplicacion-saas-multi-tenant-en-nestjs-sin-duplicar-tu-codigo' -UseBasicParsing).Content
if ($postHtml -match 'hrefLang="en"') { Write-Output 'hreflang_en=yes' } else { Write-Output 'hreflang_en=no' }
if ($postHtml -match 'hrefLang="es"') { Write-Output 'hreflang_es=yes' } else { Write-Output 'hreflang_es=no' }
if ($postHtml -match '<article[^>]*lang="([^"]+)"') { Write-Output ('article_lang=' + $Matches[1]) }

Write-Output '---BLOG_SLUGS---'
$blogHtml = (Invoke-WebRequest 'https://www.makingcode.dev/blog' -UseBasicParsing).Content
[regex]::Matches($blogHtml, 'href="/blog/([^"?]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

Write-Output '---ROBOTS---'
Write-Output (Invoke-WebRequest 'https://www.makingcode.dev/robots.txt' -UseBasicParsing).Content

Write-Output '---SITEMAP_TAIL---'
[regex]::Matches($sitemap, '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Skip 15

Write-Output '---POST_EN---'
$postEnHtml = (Invoke-WebRequest 'https://www.makingcode.dev/blog/how-to-build-a-multi-tenant-saas-application-in-nestjs-without-duplicating-your-code' -UseBasicParsing).Content
if ($postEnHtml -match '<title>([^<]+)</title>') { Write-Output ('title=' + $Matches[1]) }
if ($postEnHtml -match 'rel="canonical"[^>]+href="([^"]+)"') { Write-Output ('canonical=' + $Matches[1]) }
if ($postEnHtml -match '<html[^>]+lang="([^"]+)"') { Write-Output ('html_lang=' + $Matches[1]) }
if ($postEnHtml -match '<article[^>]*lang="([^"]+)"') { Write-Output ('article_lang=' + $Matches[1]) }
Write-Output ('jsonld=' + ([regex]::Matches($postEnHtml, 'application/ld\+json')).Count)
if ($postEnHtml -match 'og:image" content="([^"]+)"') { Write-Output ('og_image=' + $Matches[1]) }
