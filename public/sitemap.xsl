<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
      <head>
        <title>خريطة الموقع XML | SEFT Lab</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Tajawal", Tahoma, sans-serif;
            background-color: #F8FAFC;
            color: #0A1630;
            margin: 0;
            padding: 30px 20px;
            direction: rtl;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          }
          h1 {
            color: #2563EB;
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          p.desc {
            color: #64748B;
            font-size: 14px;
            margin: 0 0 20px 0;
            line-height: 1.6;
          }
          .stats {
            display: inline-block;
            background: #EFF6FF;
            color: #1D4ED8;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: right;
          }
          th {
            background-color: #F1F5F9;
            color: #334155;
            padding: 12px 14px;
            font-weight: bold;
            border-bottom: 2px solid #E2E8F0;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #F1F5F9;
          }
          tr:hover td {
            background-color: #F8FAFC;
          }
          a {
            color: #2563EB;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            background: #ECFDF5;
            color: #047857;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>خريطة الموقع المعتمدة لمحركات البحث (XML Sitemap)</h1>
          <p class="desc">هذا الملف مخصص لمحركات البحث (Google, Bing) لتمكين الفهرسة الفورية لكافة مساقات وبوابات منصة <strong>SEFT Lab</strong>.</p>
          <div class="stats">
            إجمالي الروابط المفهرسة: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> رابط
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">الرابط (URL)</th>
                <th style="width: 15%;">تاريخ التحديث</th>
                <th style="width: 15%;">معدل التغيير</th>
                <th style="width: 20%;">الأولوية (Priority)</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td dir="ltr" style="text-align: left;">
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                  <td><xsl:value-of select="sitemap:changefreq"/></td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:priority"/></span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
