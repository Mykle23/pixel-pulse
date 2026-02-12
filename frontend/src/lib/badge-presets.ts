export interface BadgePreset {
  /** Display name */
  name: string;
  /** Badge left-hand text */
  label: string;
  /** Badge right-hand text (empty = single-section) */
  message: string;
  /** simple-icons slug */
  logo: string;
  /** Logo color (hex without #) */
  logoColor: string;
  /** Right-side background color (hex without #) */
  color: string;
  /** Left-side background color (hex without #, empty = default) */
  labelColor: string;
  /** Badge style */
  style: string;
}

export interface PresetCategory {
  name: string;
  presets: BadgePreset[];
}

/* ------------------------------------------------------------------ */
/* Helper to create a preset with sensible defaults                    */
/* ------------------------------------------------------------------ */

function p(
  name: string,
  logo: string,
  color: string,
  opts?: { logoColor?: string; label?: string; message?: string; labelColor?: string; style?: string }
): BadgePreset {
  return {
    name,
    label: opts?.label ?? name,
    message: opts?.message ?? "",
    logo,
    logoColor: opts?.logoColor ?? "white",
    color,
    labelColor: opts?.labelColor ?? "",
    style: opts?.style ?? "flat",
  };
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

const LANGUAGES: BadgePreset[] = [
  p("TypeScript", "typescript", "3178C6"),
  p("JavaScript", "javascript", "F7DF1E", { logoColor: "black" }),
  p("Python", "python", "3776AB"),
  p("Rust", "rust", "000000"),
  p("Go", "go", "00ADD8"),
  p("Java", "openjdk", "ED8B00"),
  p("C#", "csharp", "239120"),
  p("C++", "cplusplus", "00599C"),
  p("C", "c", "A8B9CC", { logoColor: "black" }),
  p("Swift", "swift", "F05138"),
  p("Kotlin", "kotlin", "7F52FF"),
  p("Dart", "dart", "0175C2"),
  p("PHP", "php", "777BB4"),
  p("Ruby", "ruby", "CC342D"),
  p("Scala", "scala", "DC322F"),
  p("Elixir", "elixir", "4B275F"),
  p("Haskell", "haskell", "5D4F85"),
  p("Lua", "lua", "2C2D72"),
  p("R", "r", "276DC3"),
  p("Shell", "gnubash", "4EAA25"),
  p("Zig", "zig", "F7A41D", { logoColor: "black" }),
  p("Solidity", "solidity", "363636"),
];

const FRONTEND: BadgePreset[] = [
  p("React", "react", "20232A", { logoColor: "61DAFB" }),
  p("Next.js", "nextdotjs", "000000"),
  p("Vue.js", "vuedotjs", "4FC08D"),
  p("Nuxt.js", "nuxtdotjs", "00DC82"),
  p("Angular", "angular", "DD0031"),
  p("Svelte", "svelte", "FF3E00"),
  p("SvelteKit", "svelte", "FF3E00", { label: "SvelteKit" }),
  p("Astro", "astro", "BC52EE"),
  p("Solid", "solid", "2C4F7C"),
  p("Remix", "remix", "000000"),
  p("Gatsby", "gatsby", "663399"),
  p("Ember.js", "emberdotjs", "E04E39"),
  p("Alpine.js", "alpinedotjs", "8BC0D0", { logoColor: "black" }),
  p("Lit", "lit", "324FFF"),
  p("HTMX", "htmx", "3366CC"),
  p("jQuery", "jquery", "0769AD"),
];

const CSS_UI: BadgePreset[] = [
  p("Tailwind CSS", "tailwindcss", "06B6D4"),
  p("CSS3", "css3", "1572B6"),
  p("Sass", "sass", "CC6699"),
  p("Bootstrap", "bootstrap", "7952B3"),
  p("Material UI", "mui", "007FFF"),
  p("Chakra UI", "chakraui", "319795"),
  p("Ant Design", "antdesign", "0170FE"),
  p("Styled Components", "styledcomponents", "DB7093"),
  p("Radix UI", "radixui", "161618"),
  p("shadcn/ui", "shadcnui", "000000"),
  p("Framer Motion", "framer", "0055FF"),
  p("Storybook", "storybook", "FF4785"),
];

const BACKEND: BadgePreset[] = [
  p("Node.js", "nodedotjs", "339933"),
  p("Express", "express", "000000"),
  p("NestJS", "nestjs", "E0234E"),
  p("Fastify", "fastify", "000000"),
  p("Hono", "hono", "E36002"),
  p("Django", "django", "092E20"),
  p("Flask", "flask", "000000"),
  p("FastAPI", "fastapi", "009688"),
  p("Spring Boot", "springboot", "6DB33F"),
  p("Rails", "rubyonrails", "D30001"),
  p("Laravel", "laravel", "FF2D20"),
  p(".NET", "dotnet", "512BD4"),
  p("Gin", "gin", "00ADD8"),
  p("Fiber", "gofiber", "00ACD7"),
  p("GraphQL", "graphql", "E10098"),
  p("tRPC", "trpc", "2596BE"),
];

const DATABASES: BadgePreset[] = [
  p("PostgreSQL", "postgresql", "4169E1"),
  p("MySQL", "mysql", "4479A1"),
  p("MongoDB", "mongodb", "47A248"),
  p("SQLite", "sqlite", "003B57"),
  p("Redis", "redis", "DC382D"),
  p("Prisma", "prisma", "2D3748"),
  p("Supabase", "supabase", "3FCF8E"),
  p("Firebase", "firebase", "DD2C00"),
  p("DynamoDB", "amazondynamodb", "4053D6"),
  p("Drizzle", "drizzle", "C5F74F", { logoColor: "black" }),
  p("Elasticsearch", "elasticsearch", "005571"),
  p("MariaDB", "mariadb", "003545"),
  p("CockroachDB", "cockroachlabs", "6933FF"),
  p("Neo4j", "neo4j", "4581C3"),
  p("Cassandra", "apachecassandra", "1287B1"),
  p("InfluxDB", "influxdb", "22ADF6"),
];

const CLOUD_DEVOPS: BadgePreset[] = [
  p("AWS", "amazonaws", "232F3E"),
  p("Google Cloud", "googlecloud", "4285F4"),
  p("Azure", "microsoftazure", "0078D4"),
  p("Vercel", "vercel", "000000"),
  p("Netlify", "netlify", "00C7B7"),
  p("Cloudflare", "cloudflare", "F38020"),
  p("DigitalOcean", "digitalocean", "0080FF"),
  p("Heroku", "heroku", "430098"),
  p("Railway", "railway", "0B0D0E"),
  p("Render", "render", "46E3B7"),
  p("Docker", "docker", "2496ED"),
  p("Kubernetes", "kubernetes", "326CE5"),
  p("Terraform", "terraform", "844FBA"),
  p("Ansible", "ansible", "EE0000"),
  p("Nginx", "nginx", "009639"),
  p("Apache", "apache", "D22128"),
  p("Caddy", "caddy", "1F88C0"),
];

const CICD: BadgePreset[] = [
  p("GitHub Actions", "githubactions", "2088FF"),
  p("GitLab CI", "gitlab", "FC6D26"),
  p("Jenkins", "jenkins", "D24939"),
  p("CircleCI", "circleci", "343434"),
  p("Travis CI", "travisci", "3EAAAF"),
  p("Drone", "drone", "212121"),
  p("ArgoCD", "argo", "EF7B4D"),
];

const TESTING: BadgePreset[] = [
  p("Jest", "jest", "C21325"),
  p("Vitest", "vitest", "6E9F18"),
  p("Cypress", "cypress", "69D3A7"),
  p("Playwright", "playwright", "2EAD33"),
  p("Testing Library", "testinglibrary", "E33332"),
  p("Selenium", "selenium", "43B02A"),
  p("Mocha", "mocha", "8D6748"),
  p("Puppeteer", "puppeteer", "40B5A4"),
  p("Pytest", "pytest", "0A9EDC"),
  p("JUnit5", "junit5", "25A162"),
];

const TOOLS: BadgePreset[] = [
  p("Git", "git", "F05032"),
  p("GitHub", "github", "181717"),
  p("GitLab", "gitlab", "FC6D26"),
  p("Bitbucket", "bitbucket", "0052CC"),
  p("VS Code", "visualstudiocode", "007ACC"),
  p("Neovim", "neovim", "57A143"),
  p("IntelliJ IDEA", "intellijidea", "000000"),
  p("WebStorm", "webstorm", "000000"),
  p("Vim", "vim", "019733"),
  p("Cursor", "cursor", "000000"),
  p("npm", "npm", "CB3837"),
  p("pnpm", "pnpm", "F69220"),
  p("Yarn", "yarn", "2C8EBB"),
  p("Bun", "bun", "000000"),
  p("Vite", "vite", "646CFF"),
  p("Webpack", "webpack", "8DD6F9", { logoColor: "black" }),
  p("esbuild", "esbuild", "FFCF00", { logoColor: "black" }),
  p("Turborepo", "turborepo", "EF4444"),
  p("ESLint", "eslint", "4B32C3"),
  p("Prettier", "prettier", "F7B93E", { logoColor: "black" }),
  p("Biome", "biome", "60A5FA"),
  p("SWC", "swc", "F8C457", { logoColor: "black" }),
];

const OS: BadgePreset[] = [
  p("Linux", "linux", "FCC624", { logoColor: "black" }),
  p("Ubuntu", "ubuntu", "E95420"),
  p("Debian", "debian", "A81D33"),
  p("Fedora", "fedora", "51A2DA"),
  p("Arch Linux", "archlinux", "1793D1"),
  p("macOS", "apple", "000000"),
  p("Windows", "windows", "0078D4"),
  p("Android", "android", "34A853"),
  p("iOS", "ios", "000000"),
  p("Alpine Linux", "alpinelinux", "0D597F"),
];

const PLATFORMS: BadgePreset[] = [
  p("Electron", "electron", "47848F"),
  p("React Native", "react", "61DAFB", { label: "React Native", logoColor: "black" }),
  p("Flutter", "flutter", "02569B"),
  p("Tauri", "tauri", "24C8D8"),
  p("Expo", "expo", "000020"),
  p("Capacitor", "capacitor", "119EFF"),
  p("Unity", "unity", "000000"),
  p("Unreal Engine", "unrealengine", "0E1128"),
  p("Godot", "godotengine", "478CBF"),
];

const AI_ML: BadgePreset[] = [
  p("OpenAI", "openai", "412991"),
  p("TensorFlow", "tensorflow", "FF6F00"),
  p("PyTorch", "pytorch", "EE4C2C"),
  p("Hugging Face", "huggingface", "FFD21E", { logoColor: "black" }),
  p("LangChain", "langchain", "1C3C3C"),
  p("scikit-learn", "scikitlearn", "F7931E"),
  p("Jupyter", "jupyter", "F37626"),
  p("Ollama", "ollama", "000000"),
  p("Anthropic", "anthropic", "191919"),
];

const SOCIAL: BadgePreset[] = [
  p("Twitter / X", "x", "000000"),
  p("LinkedIn", "linkedin", "0A66C2"),
  p("Discord", "discord", "5865F2"),
  p("Slack", "slack", "4A154B"),
  p("Reddit", "reddit", "FF4500"),
  p("Stack Overflow", "stackoverflow", "F58025"),
  p("Dev.to", "devdotto", "0A0A0A"),
  p("Medium", "medium", "000000"),
  p("YouTube", "youtube", "FF0000"),
  p("Twitch", "twitch", "9146FF"),
  p("Mastodon", "mastodon", "6364FF"),
  p("Bluesky", "bluesky", "0285FF"),
];

const MISC: BadgePreset[] = [
  p("Markdown", "markdown", "000000"),
  p("JSON", "json", "000000"),
  p("YAML", "yaml", "CB171E"),
  p("RSS", "rss", "FFA500"),
  p("PWA", "pwa", "5A0FC8"),
  p("WebAssembly", "webassembly", "654FF0"),
  p("Swagger", "swagger", "85EA2D", { logoColor: "black" }),
  p("Postman", "postman", "FF6C37"),
  p("Figma", "figma", "F24E1E"),
  p("Notion", "notion", "000000"),
  p("Jira", "jira", "0052CC"),
  p("Stripe", "stripe", "008CDD"),
  p("Auth0", "auth0", "EB5424"),
  p("Let's Encrypt", "letsencrypt", "003A70"),
  p("Sentry", "sentry", "362D59"),
  p("Datadog", "datadog", "632CA6"),
  p("Grafana", "grafana", "F46800"),
];

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const PRESET_CATEGORIES: PresetCategory[] = [
  { name: "Languages", presets: LANGUAGES },
  { name: "Frontend", presets: FRONTEND },
  { name: "CSS & UI", presets: CSS_UI },
  { name: "Backend", presets: BACKEND },
  { name: "Databases", presets: DATABASES },
  { name: "Cloud & DevOps", presets: CLOUD_DEVOPS },
  { name: "CI/CD", presets: CICD },
  { name: "Testing", presets: TESTING },
  { name: "Tools & Build", presets: TOOLS },
  { name: "Operating Systems", presets: OS },
  { name: "Platforms & Mobile", presets: PLATFORMS },
  { name: "AI & ML", presets: AI_ML },
  { name: "Social & Community", presets: SOCIAL },
  { name: "Miscellaneous", presets: MISC },
];

/** Flat list of all presets (for search) */
export const ALL_PRESETS: BadgePreset[] = PRESET_CATEGORIES.flatMap(
  (c) => c.presets
);
