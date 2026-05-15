package com.career.platform.service;

import com.career.platform.dto.SkillQuestion;
import com.career.platform.dto.SkillQuestionsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionGeneratorService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    private static final Map<String, List<SkillQuestion>> QUESTION_BANK = new LinkedHashMap<>();

    static {
        // ── Java ──
        addQ("Java", "Which keyword prevents a class from being subclassed?", List.of("static", "final", "abstract", "private"), 1, "The 'final' keyword prevents inheritance.");
        addQ("Java", "What is the default value of an int in Java?", List.of("null", "0", "1", "-1"), 1, "Primitive int defaults to 0.");
        addQ("Java", "Which collection does not allow duplicate elements?", List.of("ArrayList", "LinkedList", "HashSet", "Vector"), 2, "HashSet implements Set which disallows duplicates.");
        addQ("Java", "What does JVM stand for?", List.of("Java Virtual Machine", "Java Variable Manager", "Java Version Modifier", "Java Verified Module"), 0, "JVM = Java Virtual Machine.");
        addQ("Java", "Which interface must be implemented for custom sorting?", List.of("Serializable", "Comparable", "Iterable", "Cloneable"), 1, "Comparable provides compareTo() for natural ordering.");

        // ── Python ──
        addQ("Python", "What is the output of len([1,2,3])?", List.of("2", "3", "4", "Error"), 1, "len() returns the number of elements.");
        addQ("Python", "Which keyword is used for function definition?", List.of("func", "define", "def", "function"), 2, "Python uses 'def' to define functions.");
        addQ("Python", "What data type is {'a':1}?", List.of("list", "tuple", "set", "dict"), 3, "Curly braces with key-value pairs create a dict.");
        addQ("Python", "Which library is used for data manipulation?", List.of("Flask", "Pandas", "Django", "Tkinter"), 1, "Pandas is the standard data manipulation library.");
        addQ("Python", "What does 'pip' stand for?", List.of("Python Install Packages", "Pip Installs Packages", "Python Index Protocol", "Package Install Python"), 1, "Pip Installs Packages (recursive acronym).");

        // ── JavaScript ──
        addQ("JavaScript", "What does '===' check?", List.of("Value only", "Type only", "Value and type", "Reference"), 2, "Strict equality checks both value and type.");
        addQ("JavaScript", "Which method adds an element to end of array?", List.of("push()", "pop()", "shift()", "unshift()"), 0, "push() appends to the end.");
        addQ("JavaScript", "What is a closure?", List.of("A CSS property", "Function with access to outer scope", "A loop type", "An error type"), 1, "Closures retain access to their lexical scope.");
        addQ("JavaScript", "What does 'typeof null' return?", List.of("null", "undefined", "object", "boolean"), 2, "This is a known JS quirk — typeof null is 'object'.");
        addQ("JavaScript", "Which ES6 feature declares block-scoped variables?", List.of("var", "let", "const", "Both let and const"), 3, "Both let and const are block-scoped.");

        // ── React ──
        addQ("React", "What hook manages state in functional components?", List.of("useEffect", "useState", "useRef", "useMemo"), 1, "useState returns a state variable and setter.");
        addQ("React", "What is JSX?", List.of("A database", "JavaScript XML syntax extension", "A testing framework", "A CSS preprocessor"), 1, "JSX lets you write HTML-like syntax in JavaScript.");
        addQ("React", "Which hook runs side effects?", List.of("useState", "useCallback", "useEffect", "useReducer"), 2, "useEffect handles side effects like API calls.");
        addQ("React", "What is the virtual DOM?", List.of("A browser API", "Lightweight copy of real DOM", "A database", "A CSS engine"), 1, "React uses a virtual DOM for efficient updates.");
        addQ("React", "How do you pass data from parent to child?", List.of("State", "Props", "Context", "Refs"), 1, "Props flow data downward from parent to child.");

        // ── SQL ──
        addQ("SQL", "Which clause filters grouped results?", List.of("WHERE", "HAVING", "GROUP BY", "ORDER BY"), 1, "HAVING filters after GROUP BY aggregation.");
        addQ("SQL", "What does JOIN do?", List.of("Deletes rows", "Combines rows from tables", "Creates indexes", "Drops tables"), 1, "JOIN combines rows from two or more tables.");
        addQ("SQL", "Which is fastest for checking existence?", List.of("COUNT(*)", "EXISTS", "IN", "LIKE"), 1, "EXISTS short-circuits and is generally fastest.");
        addQ("SQL", "What does ACID stand for in databases?", List.of("Add Create Insert Delete", "Atomicity Consistency Isolation Durability", "Async Connection Interface Design", "None"), 1, "ACID ensures reliable database transactions.");

        // ── HTML ──
        addQ("HTML", "Which tag creates a hyperlink?", List.of("<link>", "<a>", "<href>", "<url>"), 1, "The <a> anchor tag creates hyperlinks.");
        addQ("HTML", "What does HTML stand for?", List.of("Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Mode Link", "None"), 0, "HTML = HyperText Markup Language.");
        addQ("HTML", "Which element is used for the largest heading?", List.of("<h6>", "<heading>", "<h1>", "<head>"), 2, "<h1> is the largest heading element.");

        // ── CSS ──
        addQ("CSS", "Which property changes text color?", List.of("font-color", "text-color", "color", "foreground"), 2, "The 'color' property sets text color.");
        addQ("CSS", "What does 'display: flex' do?", List.of("Hides element", "Creates flex container", "Makes inline", "Adds border"), 1, "display:flex creates a flexbox container.");
        addQ("CSS", "Which unit is relative to viewport width?", List.of("px", "em", "vw", "rem"), 2, "vw = viewport width percentage.");

        // ── Node.js ──
        addQ("Node.js", "What is Node.js built on?", List.of("Python", "V8 Engine", "JVM", "Ruby"), 1, "Node.js runs on Chrome's V8 JavaScript engine.");
        addQ("Node.js", "Which module handles HTTP requests?", List.of("fs", "path", "http", "os"), 2, "The http module creates HTTP servers.");
        addQ("Node.js", "What is npm?", List.of("Node Package Manager", "New Program Module", "Network Protocol Manager", "None"), 0, "npm = Node Package Manager.");

        // ── TypeScript ──
        addQ("TypeScript", "What does TypeScript add to JavaScript?", List.of("Speed", "Static types", "Memory management", "Threads"), 1, "TypeScript adds static type checking.");
        addQ("TypeScript", "Which keyword defines an interface?", List.of("class", "type", "interface", "struct"), 2, "The 'interface' keyword defines contracts.");
        addQ("TypeScript", "What file extension does TypeScript use?", List.of(".js", ".ts", ".tp", ".txt"), 1, "TypeScript files use .ts extension.");

        // ── Spring Boot ──
        addQ("Spring Boot", "Which annotation marks a REST controller?", List.of("@Controller", "@RestController", "@Service", "@Bean"), 1, "@RestController combines @Controller + @ResponseBody.");
        addQ("Spring Boot", "What does @Autowired do?", List.of("Creates beans", "Injects dependencies", "Maps URLs", "Validates input"), 1, "@Autowired performs dependency injection.");
        addQ("Spring Boot", "Which file configures Spring Boot?", List.of("web.xml", "pom.xml", "application.properties", "config.json"), 2, "application.properties/yml configures Spring Boot.");

        // ── Docker ──
        addQ("Docker", "What is a Docker container?", List.of("Virtual machine", "Lightweight isolated process", "Database", "Web server"), 1, "Containers are isolated processes sharing the host OS kernel.");
        addQ("Docker", "Which file defines a Docker image?", List.of("docker-compose.yml", "Dockerfile", "package.json", "config.yml"), 1, "Dockerfile contains instructions to build an image.");
        addQ("Docker", "What command runs a container?", List.of("docker build", "docker run", "docker push", "docker pull"), 1, "docker run creates and starts a container.");

        // ── AWS ──
        addQ("AWS", "What is S3 used for?", List.of("Computing", "Object storage", "Networking", "DNS"), 1, "S3 = Simple Storage Service for object storage.");
        addQ("AWS", "Which service provides serverless computing?", List.of("EC2", "Lambda", "RDS", "S3"), 1, "AWS Lambda runs code without managing servers.");
        addQ("AWS", "What does EC2 stand for?", List.of("Elastic Compute Cloud", "Enterprise Cloud Computing", "Easy Container Control", "None"), 0, "EC2 = Elastic Compute Cloud.");

        // ── Git ──
        addQ("Git", "Which command creates a new branch?", List.of("git branch", "git merge", "git clone", "git pull"), 0, "git branch <name> creates a new branch.");
        addQ("Git", "What does 'git stash' do?", List.of("Deletes changes", "Temporarily saves changes", "Pushes to remote", "Creates branch"), 1, "git stash saves uncommitted changes temporarily.");
        addQ("Git", "Which command shows commit history?", List.of("git status", "git log", "git diff", "git show"), 1, "git log displays the commit history.");

        // ── MongoDB ──
        addQ("MongoDB", "What type of database is MongoDB?", List.of("Relational", "Document-based NoSQL", "Graph", "Key-value"), 1, "MongoDB stores data as JSON-like documents.");
        addQ("MongoDB", "Which method inserts a document?", List.of("db.insert()", "db.collection.insertOne()", "db.add()", "db.put()"), 1, "insertOne() adds a single document.");

        // ── Machine Learning ──
        addQ("Machine Learning", "What is supervised learning?", List.of("Learning without labels", "Learning with labeled data", "Reinforcement learning", "Clustering"), 1, "Supervised learning uses labeled training data.");
        addQ("Machine Learning", "What is overfitting?", List.of("Model too simple", "Model memorizes training data", "Too little data", "Fast training"), 1, "Overfitting means poor generalization to new data.");
        addQ("Machine Learning", "Which algorithm is used for classification?", List.of("Linear Regression", "K-Means", "Random Forest", "PCA"), 2, "Random Forest handles both classification and regression.");

        // ── Data Science ──
        addQ("Data Science", "What is EDA?", List.of("Error Detection Analysis", "Exploratory Data Analysis", "Extended Data Access", "None"), 1, "EDA explores data patterns before modeling.");
        addQ("Data Science", "Which chart shows distribution?", List.of("Bar chart", "Histogram", "Pie chart", "Line chart"), 1, "Histograms visualize frequency distributions.");

        // ── REST API ──
        addQ("REST API", "Which HTTP method retrieves data?", List.of("POST", "PUT", "GET", "DELETE"), 2, "GET requests retrieve resources.");
        addQ("REST API", "What status code means 'Not Found'?", List.of("200", "301", "404", "500"), 2, "404 indicates the resource was not found.");
        addQ("REST API", "What does REST stand for?", List.of("Representational State Transfer", "Remote Execute Send Transfer", "Real-time Event System", "None"), 0, "REST = Representational State Transfer.");

        // ── Kubernetes ──
        addQ("Kubernetes", "What is a Pod?", List.of("A container image", "Smallest deployable unit", "A service mesh", "A namespace"), 1, "A Pod is the smallest deployable unit in K8s.");
        addQ("Kubernetes", "What manages Pod replicas?", List.of("Service", "Deployment", "ConfigMap", "Volume"), 1, "Deployments manage replica sets of Pods.");

        // ── Angular ──
        addQ("Angular", "What language does Angular primarily use?", List.of("JavaScript", "TypeScript", "Python", "Java"), 1, "Angular is built with TypeScript.");
        addQ("Angular", "What is a component in Angular?", List.of("A service", "Building block with template+logic", "A module", "A pipe"), 1, "Components combine templates, styles, and logic.");

        // ── Vue.js ──
        addQ("Vue.js", "What is Vue's reactivity based on?", List.of("Virtual DOM only", "Proxy-based reactivity", "Manual DOM updates", "Web Workers"), 1, "Vue 3 uses JavaScript Proxy for reactivity.");

        // ── Django ──
        addQ("Django", "What pattern does Django follow?", List.of("MVC", "MVT", "MVVM", "MVP"), 1, "Django uses Model-View-Template (MVT).");
        addQ("Django", "Which command starts a Django project?", List.of("django create", "django-admin startproject", "python manage.py init", "django new"), 1, "django-admin startproject creates a new project.");

        // ── Flask ──
        addQ("Flask", "What is Flask?", List.of("Full-stack framework", "Micro web framework", "ORM tool", "Testing library"), 1, "Flask is a lightweight micro web framework for Python.");

        // ── C++ ──
        addQ("C++", "What is a pointer?", List.of("A data type", "Variable storing memory address", "A function", "A loop"), 1, "Pointers store memory addresses of other variables.");
        addQ("C++", "Which operator allocates memory dynamically?", List.of("malloc", "new", "alloc", "create"), 1, "The 'new' operator allocates heap memory in C++.");

        // ── Go ──
        addQ("Go", "What is a goroutine?", List.of("A data type", "Lightweight thread", "Package manager", "Error handler"), 1, "Goroutines are lightweight concurrent functions.");

        // ── Rust ──
        addQ("Rust", "What does Rust's ownership system prevent?", List.of("Slow compilation", "Memory leaks and data races", "Large binaries", "Network errors"), 1, "Ownership ensures memory safety without GC.");

        // ── Redis ──
        addQ("Redis", "What type of data store is Redis?", List.of("Relational", "In-memory key-value", "Document", "Graph"), 1, "Redis is an in-memory key-value data store.");

        // ── PostgreSQL ──
        addQ("PostgreSQL", "What makes PostgreSQL different from MySQL?", List.of("Not open source", "Advanced data types and MVCC", "NoSQL only", "No transactions"), 1, "PostgreSQL supports advanced types, JSONB, and MVCC.");

        // ── Linux ──
        addQ("Linux", "Which command lists files?", List.of("dir", "ls", "list", "show"), 1, "ls lists directory contents in Linux.");
        addQ("Linux", "What does chmod do?", List.of("Changes owner", "Changes permissions", "Creates files", "Moves files"), 1, "chmod changes file access permissions.");

        // ── Agile ──
        addQ("Agile", "What is a Sprint?", List.of("A test phase", "Time-boxed iteration", "A deployment", "A meeting"), 1, "Sprints are fixed-length iterations (usually 2 weeks).");
        addQ("Agile", "What is a daily standup?", List.of("Code review", "Brief daily sync meeting", "Deployment check", "Sprint planning"), 1, "Standups are short daily team sync meetings.");

        // ── CI/CD ──
        addQ("CI/CD", "What does CI stand for?", List.of("Code Integration", "Continuous Integration", "Central Index", "Cloud Infrastructure"), 1, "CI = Continuous Integration — frequent code merging.");
        addQ("CI/CD", "What is the purpose of CD?", List.of("Code debugging", "Continuous Delivery/Deployment", "Container Development", "Cloud Design"), 1, "CD automates release and deployment pipelines.");

        // ── Microservices ──
        addQ("Microservices", "What is a microservice?", List.of("Monolithic app", "Small independent service", "Database type", "Frontend framework"), 1, "Microservices are small, independently deployable services.");

        // ── GraphQL ──
        addQ("GraphQL", "How does GraphQL differ from REST?", List.of("Uses XML", "Client specifies exact data needed", "No HTTP", "Server-only"), 1, "GraphQL lets clients request exactly the data they need.");

        // ── TensorFlow / PyTorch / Deep Learning ──
        addQ("TensorFlow", "What is TensorFlow?", List.of("Database", "ML framework by Google", "Web framework", "OS"), 1, "TensorFlow is Google's open-source ML framework.");
        addQ("PyTorch", "Who developed PyTorch?", List.of("Google", "Facebook/Meta", "Microsoft", "Amazon"), 1, "PyTorch was developed by Meta's AI Research lab.");
        addQ("Deep Learning", "What is a neural network layer?", List.of("Database table", "Group of neurons performing transformations", "API endpoint", "CSS class"), 1, "Layers transform input data through weighted connections.");

        // ── Cybersecurity ──
        addQ("Cybersecurity", "What is SQL injection?", List.of("Database backup", "Malicious SQL in user input", "Query optimization", "Data encryption"), 1, "SQL injection inserts malicious SQL through user inputs.");
        addQ("Cybersecurity", "What does HTTPS provide?", List.of("Speed", "Encrypted communication", "Caching", "Compression"), 1, "HTTPS encrypts data in transit using TLS/SSL.");

        // ── Flutter / React Native ──
        addQ("Flutter", "What language does Flutter use?", List.of("JavaScript", "Kotlin", "Dart", "Swift"), 2, "Flutter uses the Dart programming language.");
        addQ("React Native", "What is React Native?", List.of("Web framework", "Cross-platform mobile framework", "Database", "Testing tool"), 1, "React Native builds native mobile apps using React.");

        // ── Power BI / Tableau ──
        addQ("Power BI", "What is Power BI?", List.of("Programming language", "Business analytics tool by Microsoft", "Database", "OS"), 1, "Power BI is Microsoft's business intelligence platform.");
        addQ("Tableau", "What is Tableau primarily used for?", List.of("Coding", "Data visualization", "Video editing", "Networking"), 1, "Tableau is a leading data visualization tool.");

        // ── Figma ──
        addQ("Figma", "What is Figma?", List.of("Code editor", "Collaborative design tool", "Database", "Framework"), 1, "Figma is a browser-based collaborative UI design tool.");

        // ── Next.js ──
        addQ("Next.js", "What rendering method does Next.js support?", List.of("Client only", "Server only", "SSR, SSG, and CSR", "None"), 2, "Next.js supports Server-Side Rendering, Static Generation, and Client-Side Rendering.");

        // ── Express.js ──
        addQ("Express.js", "What is Express.js?", List.of("Frontend framework", "Minimal Node.js web framework", "Database", "Testing tool"), 1, "Express is a minimal and flexible Node.js web application framework.");

        // ── Pandas / NumPy ──
        addQ("Pandas", "What is a DataFrame?", List.of("A chart type", "2D labeled data structure", "A Python function", "A file format"), 1, "DataFrame is a 2D labeled data structure in Pandas.");
        addQ("NumPy", "What does NumPy provide?", List.of("Web routing", "N-dimensional array operations", "File I/O only", "GUI tools"), 1, "NumPy provides efficient N-dimensional array operations.");

        // ── Kotlin / Swift ──
        addQ("Kotlin", "Kotlin is officially supported for which platform?", List.of("iOS", "Android", "Windows", "Linux"), 1, "Kotlin is Google's preferred language for Android development.");
        addQ("Swift", "Swift is used for developing apps on which platform?", List.of("Android", "Windows", "Apple/iOS", "Linux"), 2, "Swift is Apple's language for iOS/macOS development.");

        // ── PHP / Ruby ──
        addQ("PHP", "What does PHP stand for?", List.of("Personal Home Page / Hypertext Preprocessor", "Python Hypertext Protocol", "Portable Host Platform", "None"), 0, "PHP = PHP: Hypertext Preprocessor (recursive acronym).");
        addQ("Ruby", "Which framework is Ruby famous for?", List.of("Django", "Rails", "Spring", "Express"), 1, "Ruby on Rails is the most popular Ruby web framework.");

        // ── Firebase ──
        addQ("Firebase", "What is Firebase?", List.of("Programming language", "Google's BaaS platform", "CSS framework", "Database only"), 1, "Firebase is Google's Backend-as-a-Service platform.");

        // ── Elasticsearch ──
        addQ("Elasticsearch", "What is Elasticsearch used for?", List.of("Image processing", "Full-text search and analytics", "Video streaming", "Compilation"), 1, "Elasticsearch is a distributed search and analytics engine.");
    }

    private static void addQ(String skill, String question, List<String> options, int correct, String explanation) {
        QUESTION_BANK.computeIfAbsent(skill, k -> new ArrayList<>())
                .add(new SkillQuestion(skill, question, options, correct, explanation));
    }

    /**
     * Generate questions for extracted skills.
     * Uses built-in bank first, falls back to Gemini API for uncovered skills.
     */
    public SkillQuestionsResponse generateQuestions(List<String> skills, int maxPerSkill) {
        List<SkillQuestion> allQuestions = new ArrayList<>();
        List<String> uncoveredSkills = new ArrayList<>();

        for (String skill : skills) {
            // Case-insensitive lookup
            String matchedKey = QUESTION_BANK.keySet().stream()
                    .filter(k -> k.equalsIgnoreCase(skill))
                    .findFirst().orElse(null);

            if (matchedKey != null) {
                List<SkillQuestion> pool = QUESTION_BANK.get(matchedKey);
                List<SkillQuestion> shuffled = new ArrayList<>(pool);
                Collections.shuffle(shuffled);
                allQuestions.addAll(shuffled.subList(0, Math.min(maxPerSkill, shuffled.size())));
            } else {
                uncoveredSkills.add(skill);
            }
        }

        // Try Gemini API for uncovered skills
        if (!uncoveredSkills.isEmpty() && geminiApiKey != null && !geminiApiKey.isBlank()) {
            for (String skill : uncoveredSkills) {
                try {
                    List<SkillQuestion> aiQuestions = generateFromGemini(skill, maxPerSkill);
                    allQuestions.addAll(aiQuestions);
                } catch (Exception e) {
                    // Fallback: add a generic question
                    allQuestions.add(new SkillQuestion(skill,
                            "Which of the following best describes " + skill + "?",
                            List.of("A programming concept", "A tool or framework", "A methodology", "A data structure"),
                            1, "This is a generated placeholder. Configure Gemini API for better questions."));
                }
            }
        } else if (!uncoveredSkills.isEmpty()) {
            // No API key — add generic questions
            for (String skill : uncoveredSkills) {
                allQuestions.add(new SkillQuestion(skill,
                        "What is " + skill + " primarily used for?",
                        List.of("Data processing", "Application development", "System administration", "All of the above"),
                        3, skill + " can be applied in multiple domains."));
            }
        }

        Collections.shuffle(allQuestions);
        return new SkillQuestionsResponse(skills, allQuestions);
    }

    /**
     * Call Gemini API to generate MCQ questions for a skill.
     */
    private List<SkillQuestion> generateFromGemini(String skill, int count) {
        String prompt = "Generate " + count + " multiple choice questions about " + skill + " for a job interview. " +
                "Return ONLY a JSON array with objects having: question (string), options (array of 4 strings), " +
                "correctIndex (0-3 integer), explanation (string). No markdown, no extra text.";

        Map<String, Object> content = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    GEMINI_URL + geminiApiKey, content, Map.class);

            if (response == null) return List.of();

            // Parse Gemini response
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return List.of();

            @SuppressWarnings("unchecked")
            Map<String, Object> contentResp = (Map<String, Object>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
            String text = (String) parts.get(0).get("text");

            // Clean markdown fences if present
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            // Parse JSON array manually (simple approach)
            return parseGeminiQuestions(skill, text);
        } catch (Exception e) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<SkillQuestion> parseGeminiQuestions(String skill, String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> items = mapper.readValue(json, List.class);
            List<SkillQuestion> result = new ArrayList<>();
            for (Map<String, Object> item : items) {
                String q = (String) item.get("question");
                List<String> opts = (List<String>) item.get("options");
                int ci = item.get("correctIndex") instanceof Integer ? (int) item.get("correctIndex") : 0;
                String exp = (String) item.getOrDefault("explanation", "AI-generated question for " + skill);
                if (q != null && opts != null && opts.size() == 4) {
                    result.add(new SkillQuestion(skill, q, opts, ci, exp));
                }
            }
            return result;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Get list of all skills in the built-in question bank */
    public Set<String> getAvailableSkills() {
        return QUESTION_BANK.keySet();
    }

    /** Get total question count */
    public int getTotalQuestionCount() {
        return QUESTION_BANK.values().stream().mapToInt(List::size).sum();
    }
}
