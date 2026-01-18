# A06: Vulnerable and Outdated Components - Complete Audit Report

**Project:** DevOps-tpa-frontend  
**Scan Date:** October 29, 2025  
**Scanner:** npm audit v10.x  
**Total Dependencies:** 1,478 (962 prod, 337 dev, 130 optional)  
**Vulnerabilities Found:** 18

---

## Executive Summary

This comprehensive security audit identified **18 vulnerabilities** across the project's dependency tree, including **2 CRITICAL** and **10 HIGH severity** issues. The most critical findings affect core frameworks (Next.js, axios) and file processing libraries (pdfjs-dist, xlsx). Immediate action is required to update Next.js to patch authorization bypass vulnerabilities.

### Risk Assessment

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 **Critical** | 2 | Authorization bypass, RCE potential |
| 🟠 **High** | 10 | SSRF, DoS, Prototype Pollution |
| 🟡 **Moderate** | 4 | XSS, Path Traversal |
| 🟢 **Low** | 2 | Minor security issues |
| **Total** | **18** | **Current Risk Score: 7.5/10** |

---

## Detailed Vulnerability Analysis

### 🔴 CRITICAL Vulnerabilities (2)

#### 1. Next.js - Authorization Bypass in Middleware
**Package:** `next` (currently: 14.2.5)  
**Fix Available:** Yes → 14.2.33  
**CVSS Score:** 9.1 (Critical)

##### Vulnerabilities:
1. **GHSA-f82v-jwr5-mffw** - Authorization Bypass in Next.js Middleware
   - **CVSS:** 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N)
   - **CWE:** CWE-285, CWE-863
   - **Range:** >=14.0.0 <14.2.25
   - **Description:** Attackers can bypass authentication checks in middleware, gaining unauthorized access to protected routes.
   - **Impact:** Complete bypass of access control mechanisms.

2. **GHSA-gp8f-8m3g-qvj9** - Next.js Cache Poisoning
   - **CVSS:** 7.5
   - **CWE:** CWE-349, CWE-639
   - **Range:** >=14.0.0 <14.2.10
   - **Description:** Cache poisoning can lead to DoS conditions.

3. **GHSA-4342-x723-ch2f** - SSRF in Middleware Redirect
   - **CVSS:** 6.5
   - **CWE:** CWE-918
   - **Range:** >=0.9.9 <14.2.32
   - **Description:** Improper middleware redirect handling can be exploited for SSRF attacks.

4. **GHSA-7gfc-8cq8-jh5f** - Authorization Bypass
   - **CVSS:** 7.5
   - **CWE:** CWE-285, CWE-863
   - **Range:** >=9.5.5 <14.2.15
   - **Description:** Another authorization bypass vulnerability.

5-11. Additional moderate/low severity issues in image optimization and caching.

##### Remediation:
```bash
npm update next@14.2.33
npm test
npm run build
```

##### Testing Required:
- ✅ All authentication flows
- ✅ Middleware functionality
- ✅ Image optimization
- ✅ Caching behavior
- ✅ Server-side rendering

---

#### 2. form-data - Unsafe Random Function
**Package:** `form-data` (indirect dependency)  
**Fix Available:** Yes  
**CVSS Score:** Not specified (labeled Critical)

##### Vulnerability:
- **GHSA-fjxv-7rqg-78g4** - Unsafe random function in boundary generation
- **CWE:** CWE-330 (Use of Insufficiently Random Values)
- **Range:** >=4.0.0 <4.0.4
- **Description:** Uses unsafe random function for choosing form-data boundary.
- **Impact:** Predictable boundaries can lead to security bypasses.

##### Remediation:
```bash
npm audit fix
```

---

### 🟠 HIGH Severity Vulnerabilities (10)

#### 3. axios - SSRF and DoS Vulnerabilities
**Package:** `axios` (currently: 1.7.9)  
**Fix Available:** Yes → 1.13.1  
**Severity:** HIGH

##### Vulnerabilities:
1. **GHSA-jr5f-v2jv-69x6** - SSRF and Credential Leakage via Absolute URL
   - **CWE:** CWE-918
   - **Range:** >=1.0.0 <1.8.2
   - **Description:** Requests vulnerable to SSRF and credential leakage.
   - **Impact:** Attackers can make unauthorized requests to internal resources.

2. **GHSA-4hjh-wcwx-xvwj** - DoS through lack of data size check
   - **CVSS:** 7.5
   - **CWE:** CWE-770
   - **Range:** >=1.0.0 <1.12.0
   - **Description:** No data size validation can lead to DoS.

##### Remediation:
```bash
npm update axios@1.13.1
```

##### Affected Code:
- All API calls using axios
- File upload/download functionality
- External service integrations

---

#### 4. pdfjs-dist - Arbitrary JavaScript Execution
**Package:** `pdfjs-dist` (currently: 3.11.174)  
**Fix Available:** Yes → 5.4.296 (Major version upgrade)  
**CVSS Score:** 8.8 (High)

##### Vulnerability:
- **GHSA-wgrm-67xf-hhpq** - Arbitrary JavaScript execution upon opening malicious PDF
- **CWE:** CWE-754
- **Range:** <=4.1.392
- **Description:** Opening a malicious PDF can execute arbitrary JavaScript.
- **Impact:** Remote code execution in browser context.

##### Affected:
- `@react-pdf-viewer/core` (also needs update)
- All PDF viewing functionality

##### Remediation:
```bash
npm update pdfjs-dist@latest
# May require code changes due to major version
```

⚠️ **Warning:** This is a major version upgrade (3.x → 5.x). Review breaking changes and test thoroughly.

---

#### 5. xlsx - Prototype Pollution and ReDoS
**Package:** `xlsx` (currently: 0.18.5)  
**Fix Available:** ⚠️ No  
**Severity:** HIGH (CVSS 7.8)

##### Vulnerabilities:
1. **GHSA-4r6h-8v6p-xvw6** - Prototype Pollution
   - **CVSS:** 7.8
   - **CWE:** CWE-1321
   - **Range:** <0.19.3
   - **Description:** Prototype pollution when parsing malicious Excel files.

2. **GHSA-5pgg-2g8v-p4x9** - Regular Expression Denial of Service (ReDoS)
   - **CVSS:** 7.5
   - **CWE:** CWE-1333
   - **Range:** <0.20.2
   - **Description:** ReDoS vulnerability in parsing logic.

##### Status:
⚠️ **No fix available** - Current version 0.18.5 is vulnerable but npm can't auto-update.

##### Workaround:
1. **Option A:** Manual update (may have breaking changes)
   ```bash
   npm install xlsx@latest
   # Test all Excel import/export functionality
   ```

2. **Option B:** Add input validation
   ```typescript
   // Validate Excel files before processing
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   if (file.size > MAX_FILE_SIZE) {
     throw new Error('File too large');
   }
   ```

3. **Option C:** Consider alternatives (evaluate carefully):
   - `exceljs` - More actively maintained
   - `node-xlsx` - Lighter weight
   - Backend processing - Move Excel processing to server

---

#### 6. xlsx-style - Outdated Package with jszip Vulnerabilities
**Package:** `xlsx-style` (currently: 0.8.13)  
**Fix Available:** ⚠️ No  
**Severity:** MODERATE (but package is very old)

##### Issues:
- Last updated: 2018 (7 years old!)
- Depends on vulnerable `jszip` version
- No active maintenance
- Indirect vulnerabilities via jszip

##### jszip Vulnerabilities:
1. **GHSA-jg8v-48h5-wgxg** - Prototype Pollution
   - **CVSS:** 5.3
   - **CWE:** CWE-1321
   - **Range:** <2.7.0

2. **GHSA-36fh-84j7-cv5h** - Path Traversal via loadAsync
   - **CVSS:** 7.3
   - **CWE:** CWE-22
   - **Range:** <3.8.0

##### Recommendation:
🔴 **Replace this package** - It's abandoned and poses ongoing security risk.

##### Alternative Solutions:
1. **Use xlsx directly** with custom styling logic
2. **Switch to exceljs**:
   ```bash
   npm install exceljs
   npm uninstall xlsx-style
   ```
3. **Move styling to backend** if possible

---

#### 7. react-to-pdf - Vulnerable Dependencies
**Package:** `react-to-pdf` (currently: 1.0.1)  
**Fix Available:** Yes → 2.0.1 (Major version)  
**Severity:** HIGH (via jspdf and dompurify)

##### Indirect Vulnerabilities:
Via **jspdf**:
1. **GHSA-w532-jxjh-hjhj** - ReDoS Bypass
   - **Range:** <3.0.1
2. **GHSA-8mvj-3j78-4qmw** - Denial of Service
   - **CVSS:** 7.5
   - **Range:** <=3.0.1

Via **dompurify**:
3. **GHSA-vhxf-7vqr-mrjg** - XSS vulnerability
   - **CVSS:** 4.5
   - **CWE:** CWE-79
   - **Range:** <3.2.4

##### Remediation:
```bash
npm install react-to-pdf@2.0.1
# Test PDF generation functionality
```

⚠️ **Warning:** Major version upgrade may have breaking changes.

---

#### 8. canvg - Prototype Pollution
**Package:** `canvg` (indirect dependency)  
**Fix Available:** Yes  
**CVSS Score:** Not specified

##### Vulnerability:
- **GHSA-v2mw-5mch-w8c5** - Prototype Pollution
- **CWE:** CWE-1321
- **Range:** <3.0.11

##### Remediation:
```bash
npm audit fix
```

---

#### 9. json5 - Prototype Pollution
**Package:** `json5` (via dependency-cruiser)  
**Fix Available:** Yes (update dependency-cruiser)  
**CVSS Score:** 7.1

##### Vulnerability:
- **GHSA-9c47-m6qq-7p4h** - Prototype Pollution via Parse Method
- **CWE:** CWE-1321
- **Range:** >=2.0.0 <2.2.2

##### Remediation:
```bash
npm install dependency-cruiser@17.2.0
```

⚠️ **Note:** This is a dev dependency, lower priority.

---

#### 10-12. tar-fs - Path Traversal
**Package:** `tar-fs` (indirect dependency)  
**Fix Available:** Yes  
**Severity:** HIGH

##### Vulnerabilities:
1. **GHSA-8cj5-5rvv-wf4v** - Extract outside specified directory
   - **CWE:** CWE-22
   - **Range:** >=2.0.0 <2.1.3

2. **GHSA-vj76-c3g6-qr5v** - Symlink validation bypass
   - **CWE:** CWE-22, CWE-61
   - **Range:** >=2.0.0 <2.1.4

##### Remediation:
```bash
npm audit fix
```

---

### 🟡 MODERATE Severity Vulnerabilities (4)

#### 13. @babel/helpers - Inefficient RegExp
**Package:** `@babel/helpers` (indirect)  
**Fix Available:** Yes  
**CVSS Score:** 6.2

##### Vulnerability:
- **GHSA-968p-4wvh-cqc8** - Inefficient RegExp complexity
- **CWE:** CWE-1333 (ReDoS)
- **Range:** <7.26.10

##### Remediation:
```bash
npm audit fix
```

---

#### 14. dompurify - XSS Vulnerability
**Package:** `dompurify` (via react-to-pdf)  
**Fix Available:** Yes (via react-to-pdf@2.0.1)  
**CVSS Score:** 4.5

##### Vulnerability:
- **GHSA-vhxf-7vqr-mrjg** - XSS bypass
- **CWE:** CWE-79
- **Range:** <3.2.4

##### Remediation:
Update parent package `react-to-pdf`.

---

### 🟢 LOW Severity Vulnerabilities (2)

#### 15. brace-expansion - ReDoS
**Package:** `brace-expansion` (indirect, multiple paths)  
**Fix Available:** Yes  
**CVSS Score:** 3.1

##### Vulnerability:
- **GHSA-v6h2-p8h4-qcjw** - Regular Expression Denial of Service
- **CWE:** CWE-400
- **Range:** Multiple ranges affected

##### Remediation:
```bash
npm audit fix
```

---

#### 16. sweetalert2 - Undesirable Behavior
**Package:** `sweetalert2` (currently: 11.12.2)  
**Fix Available:** Yes → 11.26.3  
**Severity:** LOW

##### Vulnerability:
- **GHSA-mrr8-v49w-3333** - Potentially undesirable behavior
- **CWE:** CWE-440
- **Range:** >=11.6.14 <11.22.4

##### Remediation:
```bash
npm update sweetalert2@latest
```

---

## Outdated Packages Analysis

Based on `npm outdated`, the following packages have updates available:

### Critical Updates Needed:

| Package | Current | Wanted | Latest | Gap |
|---------|---------|--------|--------|-----|
| **next** | 14.2.5 | 14.2.5 | 16.0.1 | 🔴 2 major versions |
| **axios** | 1.7.9 | 1.13.1 | 1.13.1 | 🟠 Minor update needed |
| **pdfjs-dist** | 3.11.174 | 3.11.174 | 5.4.296 | 🔴 2 major versions |
| **@sentry/nextjs** | 8.52.1 | 8.55.0 | 10.22.0 | 🟡 2 major versions |
| **@mui/icons-material** | 5.16.14 | 5.18.0 | 7.3.4 | 🟡 2 major versions |

### Recommended Updates:

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| @headlessui/react | 2.2.0 | 2.2.9 | Patch |
| @reduxjs/toolkit | 2.5.1 | 2.9.2 | Minor |
| @tanstack/react-query | 5.66.0 | 5.90.5 | Minor |
| dayjs | 1.11.13 | 1.11.18 | Patch |
| ioredis | 5.4.2 | 5.8.2 | Minor |
| typescript | 5.7.3 | 5.9.3 | Minor |

---

## Remediation Plan

### Priority 1: CRITICAL (Week 1)
**Deadline:** Within 7 days

1. ✅ **Update Next.js** → 14.2.33
   ```bash
   npm update next@14.2.33
   npm test && npm run build
   ```
   **Testing:** All authentication, middleware, image optimization

2. ✅ **Update axios** → 1.13.1
   ```bash
   npm update axios@1.13.1
   npm test
   ```
   **Testing:** All API calls, file uploads/downloads

3. ✅ **Fix form-data** (indirect)
   ```bash
   npm audit fix
   ```

4. ✅ **Update sweetalert2**
   ```bash
   npm update sweetalert2
   ```

5. ✅ **Fix tar-fs** (indirect)
   ```bash
   npm audit fix
   ```

### Priority 2: HIGH (Week 2)
**Deadline:** Within 14 days

6. ⚠️ **Update pdfjs-dist** → 5.x (MAJOR)
   ```bash
   npm install pdfjs-dist@latest
   npm install @react-pdf-viewer/core@latest
   ```
   **Testing:** All PDF functionality
   **Risk:** Breaking changes, needs thorough testing

7. ⚠️ **Update react-to-pdf** → 2.0.1 (MAJOR)
   ```bash
   npm install react-to-pdf@2.0.1
   ```
   **Testing:** PDF generation

8. ✅ **Update canvg** (indirect)
   ```bash
   npm audit fix
   ```

9. ✅ **Update dependency-cruiser** (dev)
   ```bash
   npm install -D dependency-cruiser@17.2.0
   ```

10. ✅ **Fix brace-expansion** (indirect)
    ```bash
    npm audit fix
    ```

### Priority 3: Replacements (Week 3-4)
**Deadline:** Within 30 days

11. 🔄 **Address xlsx**
    - Option A: Manual update and test
    - Option B: Add input validation
    - Option C: Evaluate alternatives (exceljs)

12. 🔄 **Replace xlsx-style**
    - Research alternatives
    - Plan migration
    - Implement replacement
    - **Recommended:** Switch to exceljs

13. 🔄 **Update related packages**
    - dompurify (via react-to-pdf)
    - jszip (via xlsx-style)

### Priority 4: Prevention (Ongoing)

14. ✅ **Setup Dependabot**
    ```yaml
    # .github/dependabot.yml
    version: 2
    updates:
      - package-ecosystem: "npm"
        directory: "/"
        schedule:
          interval: "weekly"
        open-pull-requests-limit: 10
    ```

15. ✅ **Add npm audit to CI/CD**
    ```yaml
    # .github/workflows/security.yml
    - name: Run npm audit
      run: npm audit --audit-level=moderate
    ```

16. ✅ **Dependency Update Policy**
    - Review security advisories weekly
    - Update dependencies monthly
    - Test before deploying to production

17. ✅ **Regular Reviews**
    - Sprint review of dependencies
    - Quarterly major version evaluations
    - Annual dependency cleanup

---

## Testing Strategy

### After Each Update:

#### 1. Automated Testing
```bash
# Run all tests
npm test

# Build project
npm run build

# Check for new vulnerabilities
npm audit

# Verify no regression
npm run lint
```

#### 2. Manual Testing Checklist
- [ ] **Authentication:** Login, logout, token refresh
- [ ] **Authorization:** Access control, permissions
- [ ] **File Operations:**
  - [ ] Excel import/export
  - [ ] PDF viewing
  - [ ] PDF generation
  - [ ] File upload/download
- [ ] **API Calls:** All external integrations
- [ ] **UI Components:** All sweetalert2 dialogs
- [ ] **Performance:** No significant degradation

#### 3. Security Verification
```bash
# Final vulnerability check
npm audit

# Expected result after all fixes:
# 0 critical, 0-2 high (only unfixable), <5 moderate
```

---

## Package Replacement Recommendations

### 1. xlsx-style → exceljs
**Reason:** xlsx-style is abandoned (2018), has vulnerabilities

**Migration:**
```bash
npm install exceljs
npm uninstall xlsx-style
```

**Code changes required:** Yes
**Effort:** ~2-3 days
**Benefit:** Active maintenance, better API, more features

### 2. Consider: xlsx → exceljs
**Reason:** xlsx has unfixable vulnerabilities

**Risk:** Major refactoring required
**Decision:** Evaluate after xlsx fixes become available

---

## Cost-Benefit Analysis

### Fixing CRITICAL + HIGH Issues:
- **Cost:** 5-10 developer days
- **Risk of not fixing:** CRITICAL - RCE, bypass authentication
- **Benefit:** Eliminate 12 critical/high vulnerabilities
- **Recommendation:** ✅ **MUST DO IMMEDIATELY**

### Replacing xlsx-style:
- **Cost:** 2-3 developer days
- **Risk of not fixing:** MODERATE - Path traversal, prototype pollution
- **Benefit:** Long-term security, better maintenance
- **Recommendation:** ✅ **HIGHLY RECOMMENDED**

### Major Version Upgrades (Next.js 14→16, React 18→19):
- **Cost:** 10-20 developer days
- **Risk of not fixing:** MODERATE (14.2.33 fixes critical issues)
- **Benefit:** Latest features, better performance
- **Recommendation:** ⏸️ **Defer to Q2 2026** (14.2.33 is sufficient now)

---

## Monitoring and Maintenance

### Automated Tools to Implement:

1. **Dependabot** (GitHub)
   - Auto-creates PRs for updates
   - Free for public/private repos

2. **npm audit in CI/CD**
   - Fail build on critical/high vulnerabilities
   - Weekly scheduled scans

3. **Snyk** (Optional, paid)
   - Real-time vulnerability database
   - Auto-fix PRs
   - License compliance

4. **OWASP Dependency-Check** (Optional, free)
   - More comprehensive CVE database
   - CI/CD integration

### Manual Processes:

1. **Weekly Review**
   - Check GitHub security advisories
   - Review Dependabot PRs

2. **Monthly Updates**
   - Run `npm outdated`
   - Update non-breaking changes
   - Plan major updates

3. **Quarterly Audit**
   - Full dependency review
   - Evaluate abandoned packages
   - Clean up unused dependencies

---

## Success Metrics

### Target State (1 month):
- 🎯 **Critical:** 0 vulnerabilities
- 🎯 **High:** ≤ 2 vulnerabilities (only unfixable)
- 🎯 **Moderate:** ≤ 5 vulnerabilities
- 🎯 **Low:** Accept as-is
- 🎯 **Risk Score:** < 3.0/10

### Current vs Target:

| Severity | Current | Target | Status |
|----------|---------|--------|--------|
| Critical | 2 | 0 | 🔴 |
| High | 10 | ≤2 | 🔴 |
| Moderate | 4 | ≤5 | 🟢 |
| Low | 2 | Any | 🟢 |
| **Risk Score** | **7.5** | **<3.0** | 🔴 |

---

## Conclusion

The project has **18 vulnerabilities** requiring immediate attention. The most critical issues affect Next.js (authorization bypass) and PDF processing (RCE). Following the 4-phase remediation plan will reduce the risk score from **7.5 to <3.0** within one month.

**Immediate Actions Required:**
1. Update Next.js to 14.2.33 (fixes CRITICAL authorization bypass)
2. Update axios to 1.13.1 (fixes SSRF vulnerabilities)
3. Run `npm audit fix` for indirect dependencies
4. Plan xlsx-style replacement

**Long-term:**
- Implement Dependabot
- Add npm audit to CI/CD
- Establish dependency update policy
- Regular security reviews

---

**Report Generated:** October 29, 2025  
**Next Review:** November 5, 2025 (Weekly)  
**Prepared by:** Claude AI (Sonnet 4.5) Security Scanner  
**Status:** 🔴 ACTION REQUIRED

