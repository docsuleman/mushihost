export const KB_CATEGORIES = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Set up your hosting account and launch your first website.',
    articles: [
      {
        title: 'Creating Your MushiHost Account',
        content: 'Visit mushihost.com and click "Get Started." Choose a hosting plan, enter your details, and complete payment. Your account is provisioned instantly and you will receive a welcome email with your login credentials and cPanel access details.',
      },
      {
        title: 'Logging Into cPanel',
        content: 'Access your cPanel at yourdomain.com/cpanel or through the direct URL provided in your welcome email. Use the username and password from your welcome email. We recommend changing your password immediately after first login for security.',
      },
      {
        title: 'Uploading Your Website Files',
        content: 'You can upload files using cPanel File Manager (browser-based), FTP with credentials from your welcome email (we recommend FileZilla), or SSH/SFTP for advanced users. Upload files to the public_html directory for your primary domain.',
      },
      {
        title: 'Installing WordPress with One Click',
        content: 'In cPanel, navigate to the Softaculous Apps Installer. Click WordPress, then "Install Now." Fill in your site name, admin username, and password. Click "Install" and your WordPress site will be ready in under a minute.',
      },
      {
        title: 'Pointing Your Domain to MushiHost',
        content: 'Update your domain\'s nameservers to ns1.mushihost.com and ns2.mushihost.com at your domain registrar. DNS propagation typically takes 1-24 hours. Alternatively, you can use A records pointing to the IP address shown in your cPanel.',
      },
    ],
  },
  {
    slug: 'domains',
    title: 'Domain Management',
    description: 'Manage domains, DNS records, and nameservers.',
    articles: [
      {
        title: 'Adding a Domain to Your Account',
        content: 'In cPanel, go to "Addon Domains" or "Domains." Enter your domain name, and cPanel will auto-fill the subdomain and document root. Click "Add Domain." The domain will be ready to use once DNS propagation is complete.',
      },
      {
        title: 'Managing DNS Records',
        content: 'Navigate to "Zone Editor" in cPanel to manage DNS records. You can add, edit, or delete A, AAAA, CNAME, MX, TXT, and SRV records. Changes typically propagate within 1-4 hours, though some ISPs may take up to 24 hours.',
      },
      {
        title: 'Setting Up a Subdomain',
        content: 'In cPanel, go to "Subdomains." Enter the subdomain name (e.g., "blog"), select the parent domain, and specify the document root. The subdomain will be created immediately and you can start uploading content or installing applications.',
      },
      {
        title: 'Transferring a Domain to MushiHost',
        content: 'Unlock your domain at your current registrar and obtain the EPP/transfer code. Initiate the transfer through your MushiHost dashboard. Confirm the transfer via the email sent to the domain\'s admin contact. Transfers typically complete within 5-7 days.',
      },
      {
        title: 'Setting Up Domain Redirects',
        content: 'In cPanel, go to "Redirects." Choose between temporary (302) or permanent (301) redirects. Enter the source URL and destination URL. You can redirect the entire domain or specific pages. This is useful for domain consolidation or URL changes.',
      },
    ],
  },
  {
    slug: 'email',
    title: 'Email Hosting',
    description: 'Set up and manage professional email accounts.',
    articles: [
      {
        title: 'Creating an Email Account',
        content: 'In cPanel, navigate to "Email Accounts." Click "Create" and enter the desired email address (e.g., info@yourdomain.com), set a strong password, and configure the mailbox quota. The email account is available immediately after creation.',
      },
      {
        title: 'Configuring Email Clients',
        content: 'Use these settings for email clients: Incoming (IMAP): mail.yourdomain.com, Port 993, SSL. Incoming (POP3): mail.yourdomain.com, Port 995, SSL. Outgoing (SMTP): mail.yourdomain.com, Port 465, SSL. Use your full email address as the username.',
      },
      {
        title: 'Using Webmail',
        content: 'Access webmail at yourdomain.com/webmail or through the direct URL in cPanel. We offer Roundcube as the default webmail client. You can read, compose, and manage emails directly from your browser without installing any software.',
      },
      {
        title: 'Setting Up Email Forwarding',
        content: 'In cPanel, go to "Forwarders." Click "Add Forwarder," enter the email address to forward from and the destination address. You can forward to one or multiple addresses. The original mailbox can still receive copies if configured.',
      },
      {
        title: 'Configuring SPF, DKIM, and DMARC',
        content: 'These DNS records help prevent email spoofing and improve deliverability. In cPanel, go to "Email Deliverability" to auto-configure SPF and DKIM. For DMARC, add a TXT record for _dmarc.yourdomain.com with your preferred policy (e.g., v=DMARC1; p=quarantine).',
      },
    ],
  },
  {
    slug: 'wordpress',
    title: 'WordPress Hosting',
    description: 'Optimize and manage your WordPress installation.',
    articles: [
      {
        title: 'Optimizing WordPress Performance',
        content: 'Install a caching plugin like LiteSpeed Cache (recommended for our servers). Optimize images using ShortPixel or Imagify. Minimize plugins — deactivate and delete unused ones. Use a lightweight theme and enable GZIP compression. Our servers handle PHP OpCache automatically.',
      },
      {
        title: 'Updating WordPress Safely',
        content: 'Always back up your site before updating. On managed WordPress plans, updates are automatic. For manual updates: go to Dashboard > Updates, update WordPress core first, then plugins one at a time, then your theme. Test your site after each update.',
      },
      {
        title: 'Securing Your WordPress Site',
        content: 'Use strong passwords for all accounts. Install a security plugin (Wordfence or Sucuri). Enable two-factor authentication. Limit login attempts. Keep WordPress, themes, and plugins updated. Change the default "admin" username. Our servers provide additional WAF protection.',
      },
      {
        title: 'Using the Staging Environment',
        content: 'Available on Business and Pro plans. In your dashboard, click "Create Staging Site." Make your changes and test thoroughly in the staging environment. When ready, click "Push to Live" to deploy changes to your production site without downtime.',
      },
      {
        title: 'Migrating WordPress to MushiHost',
        content: 'Option 1: Use our free migration service — submit a ticket and our team handles everything. Option 2: Install the "All-in-One WP Migration" plugin on both sites, export from the old host, import on MushiHost. Option 3: Manual migration via phpMyAdmin and FTP.',
      },
    ],
  },
  {
    slug: 'security',
    title: 'Security & SSL',
    description: 'Secure your website with SSL, firewalls, and best practices.',
    articles: [
      {
        title: 'How Free SSL Works on MushiHost',
        content: 'We use Let\'s Encrypt to provide free SSL certificates for all domains and subdomains on your account. SSL is automatically issued within minutes of adding a domain and auto-renews every 90 days. No configuration needed — HTTPS just works.',
      },
      {
        title: 'Forcing HTTPS on Your Website',
        content: 'In cPanel, go to "SSL/TLS Status" and ensure your certificate is active. Then go to "Domains" and enable "Force HTTPS Redirect." Alternatively, add this to your .htaccess file: RewriteEngine On / RewriteCond %{HTTPS} off / RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
      },
      {
        title: 'Understanding DDoS Protection',
        content: 'All MushiHost servers include enterprise-grade DDoS protection that operates at the network edge. It automatically detects volumetric, protocol, and application-layer attacks and filters malicious traffic before it reaches your server. No configuration is required.',
      },
      {
        title: 'Setting Up Two-Factor Authentication',
        content: 'In cPanel, go to "Two-Factor Authentication." Scan the QR code with an authenticator app (Google Authenticator, Authy). Enter the 6-digit code to verify and enable 2FA. You will need the code each time you log in for enhanced security.',
      },
      {
        title: 'Malware Scanning and Removal',
        content: 'Our servers run automated malware scans daily. If malware is detected, you will receive an email alert. For immediate scanning, use "ImunifyAV" in cPanel. If your site is compromised, our security team can assist with cleanup — submit a priority support ticket.',
      },
    ],
  },
  {
    slug: 'billing',
    title: 'Billing & Account',
    description: 'Manage payments, invoices, and account settings.',
    articles: [
      {
        title: 'Understanding Your Invoice',
        content: 'Invoices are generated at the start of each billing cycle. They include the plan name, billing period, amount, taxes (if applicable), and payment method. View and download invoices from Dashboard > Invoices. Invoices are also emailed to your registered address.',
      },
      {
        title: 'Updating Your Payment Method',
        content: 'Go to Dashboard > Payment Methods. Click "Add Payment Method" to add a new card or PayPal account. Set your preferred method as default for auto-renewals. You can remove old payment methods after adding a new one.',
      },
      {
        title: 'Upgrading or Downgrading Your Plan',
        content: 'Navigate to Dashboard > Subscriptions and click "Change Plan." Select your new plan. Upgrades are applied immediately — you pay only the prorated difference. Downgrades take effect at the next billing cycle to ensure no service disruption.',
      },
      {
        title: 'Cancelling Your Hosting Plan',
        content: 'Go to Dashboard > Subscriptions, select the plan, and click "Cancel." Monthly plans are cancelled at the end of the current period. Annual plans within the 30-day guarantee get a full refund. After the guarantee period, the plan remains active until expiry.',
      },
      {
        title: 'Requesting a Refund',
        content: 'Eligible for a refund within 30 days of initial purchase on shared and WordPress plans. Go to Dashboard > Billing or email billing@mushihost.com. Refunds are processed within 1-2 business days and returned to the original payment method within 5-10 business days.',
      },
    ],
  },
]
