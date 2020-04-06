const charsetUTF8 = "charset=UTF-8";

export namespace HttpMethod {
  export const Get = "GET",
    Head = "HEAD",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE",
    Connect = "CONNECT",
    Options = "OPTIONS",
    Trace = "TRACE";
}

export namespace Header {
  export const Accept = "Accept",
    AcceptEncoding = "Accept-Encoding",
    Allow = "Allow",
    Authorization = "Authorization",
    ContentDisposition = "Content-Disposition",
    ContentEncoding = "Content-Encoding",
    ContentLength = "Content-Length",
    ContentType = "Content-Type",
    Cookie = "Cookie",
    SetCookie = "Set-Cookie",
    IfModifiedSince = "If-Modified-Since",
    LastModified = "Last-Modified",
    Location = "Location",
    Upgrade = "Upgrade",
    Vary = "Vary",
    WWWAuthenticate = "WWW-Authenticate",
    XForwardedFor = "X-Forwarded-For",
    XForwardedProto = "X-Forwarded-Proto",
    XForwardedProtocol = "X-Forwarded-Protocol",
    XForwardedSsl = "X-Forwarded-Ssl",
    XUrlScheme = "X-Url-Scheme",
    XHTTPMethodOverride = "X-HTTP-Method-Override",
    XRealIP = "X-Real-IP",
    XRequestID = "X-Request-ID",
    XRequestedWith = "X-Requested-With",
    Server = "Server",
    Origin = "Origin", // Access control
    AccessControlRequestMethod = "Access-Control-Request-Method",
    AccessControlRequestHeaders = "Access-Control-Request-Headers",
    AccessControlAllowOrigin = "Access-Control-Allow-Origin",
    AccessControlAllowMethods = "Access-Control-Allow-Methods",
    AccessControlAllowHeaders = "Access-Control-Allow-Headers",
    AccessControlAllowCredentials = "Access-Control-Allow-Credentials",
    AccessControlExposeHeaders = "Access-Control-Expose-Headers",
    AccessControlMaxAge = "Access-Control-Max-Age", // Security
    StrictTransportSecurity = "Strict-Transport-Security",
    XContentTypeOptions = "X-Content-Type-Options",
    XXSSProtection = "X-XSS-Protection",
    XFrameOptions = "X-Frame-Options",
    ContentSecurityPolicy = "Content-Security-Policy",
    ContentSecurityPolicyReportOnly = "Content-Security-Policy-Report-Only",
    XCSRFToken = "X-CSRF-Token",
    ReferrerPolicy = "Referrer-Policy";
}

export namespace MIME {
  export const ApplicationGZip = "application/gzip",
    ApplicationJSON = "application/json",
    ApplicationJSONCharsetUTF8 = ApplicationJSON + "; " + charsetUTF8,
    ApplicationJavaScript = "application/javascript",
    ApplicationJavaScriptCharsetUTF8 = ApplicationJavaScript + "; " +
      charsetUTF8,
    ApplicationXML = "application/xml",
    ApplicationXMLCharsetUTF8 = ApplicationXML + "; " + charsetUTF8,
    TextMarkdown = "text/markdown",
    TextMarkdownCharsetUTF8 = TextMarkdown + "; " + charsetUTF8,
    TextXML = "text/xml",
    TextXMLCharsetUTF8 = TextXML + "; " + charsetUTF8,
    ApplicationForm = "application/x-www-form-urlencoded",
    ApplicationProtobuf = "application/protobuf",
    ApplicationMsgpack = "application/msgpack",
    TextHTML = "text/html",
    TextHTMLCharsetUTF8 = TextHTML + "; " + charsetUTF8,
    TextPlain = "text/plain",
    TextPlainCharsetUTF8 = TextPlain + "; " + charsetUTF8,
    MultipartForm = "multipart/form-data",
    OctetStream = "application/octet-stream";

  export const DB: Record<string, string | undefined> = {
    ".md": TextMarkdownCharsetUTF8,
    ".html": TextHTMLCharsetUTF8,
    ".htm": TextHTMLCharsetUTF8,
    ".json": ApplicationJSON,
    ".map": ApplicationJSON,
    ".txt": TextPlainCharsetUTF8,
    ".ts": ApplicationJavaScriptCharsetUTF8,
    ".tsx": ApplicationJavaScriptCharsetUTF8,
    ".js": ApplicationJavaScriptCharsetUTF8,
    ".jsx": ApplicationJavaScriptCharsetUTF8,
    ".gz": ApplicationGZip,
  };
}
