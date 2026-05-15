package com.career.platform.service;

import com.career.platform.dto.InterviewQuestion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Generates interview questions from student skills.
 * Uses Gemini API when available, falls back to built-in bank.
 */
@Service
public class InterviewQuestionService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    // Built-in question bank: skill -> list of (question, difficulty, tip, expectedAnswer, keywords)
    private static final Map<String, List<String[]>> BANK = new LinkedHashMap<>();

    static {
        bank("Java",
            new String[]{"Explain the difference between HashMap and ConcurrentHashMap.", "Medium", "Focus on thread-safety and locking mechanisms.", "HashMap is not thread-safe while ConcurrentHashMap uses segment-level locking for concurrent access without blocking the entire map.", "thread-safe,segment,locking,concurrent,synchronized"},
            new String[]{"What is the Java Memory Model and how does garbage collection work?", "Hard", "Discuss heap, stack, and GC algorithms like G1.", "JMM defines how threads interact through memory. GC automatically reclaims unused objects using algorithms like G1 which divides heap into regions.", "heap,stack,garbage collection,G1,regions,memory"},
            new String[]{"How does method overloading differ from method overriding?", "Easy", "Compile-time vs runtime polymorphism.", "Overloading is compile-time polymorphism with same method name but different parameters. Overriding is runtime polymorphism where subclass provides specific implementation.", "compile-time,runtime,polymorphism,parameters,subclass"},
            new String[]{"What are functional interfaces and how are they used with lambdas?", "Medium", "Mention @FunctionalInterface, Predicate, Function.", "Functional interfaces have exactly one abstract method and can be implemented using lambda expressions. Examples include Predicate, Function, Consumer.", "abstract method,lambda,Predicate,Function,Consumer"},
            new String[]{"Explain the SOLID principles with Java examples.", "Hard", "Give a concrete example for each principle.", "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Each principle promotes maintainable and extensible code.", "single responsibility,open closed,liskov,interface segregation,dependency inversion"});

        bank("Python",
            new String[]{"What are Python decorators and how do they work?", "Medium", "Explain with a custom decorator example.", "Decorators are functions that modify the behavior of other functions. They use the @decorator syntax and wrap functions to add functionality.", "wrapper,function,modify,behavior,syntax"},
            new String[]{"Explain the difference between list, tuple, and set.", "Easy", "Focus on mutability and use cases.", "Lists are mutable ordered sequences, tuples are immutable ordered sequences, and sets are mutable unordered collections of unique elements.", "mutable,immutable,ordered,unique,sequence"},
            new String[]{"How does Python's GIL affect multithreading?", "Hard", "Discuss GIL limitations and multiprocessing alternatives.", "The GIL allows only one thread to execute Python bytecode at a time, limiting true parallelism. Use multiprocessing or async for CPU-bound and I/O-bound tasks respectively.", "GIL,bytecode,parallelism,multiprocessing,async"},
            new String[]{"What are generators and when would you use them?", "Medium", "Mention yield, memory efficiency, lazy evaluation.", "Generators use yield to produce values lazily, one at a time, making them memory efficient for large datasets.", "yield,lazy,memory,efficient,iterator"},
            new String[]{"Explain list comprehension vs map/filter.", "Easy", "Show examples of each approach.", "List comprehension provides concise syntax for creating lists. Map applies a function to all items, filter selects items matching a condition.", "comprehension,map,filter,concise,function"});

        bank("JavaScript",
            new String[]{"Explain event loop and how async/await works under the hood.", "Hard", "Discuss call stack, task queue, microtask queue.", "The event loop processes the call stack, then microtask queue (promises), then task queue (setTimeout). Async/await is syntactic sugar over promises.", "call stack,microtask,task queue,promises,event loop"},
            new String[]{"What is the difference between var, let, and const?", "Easy", "Scope, hoisting, and reassignment rules.", "var is function-scoped and hoisted, let is block-scoped and can be reassigned, const is block-scoped and cannot be reassigned.", "function-scoped,block-scoped,hoisted,reassigned,const"},
            new String[]{"How do Promises work and what is Promise chaining?", "Medium", "Explain resolve, reject, .then(), .catch().", "Promises represent asynchronous operations with pending, fulfilled, or rejected states. Chaining uses .then() to sequence operations.", "asynchronous,pending,fulfilled,rejected,then,catch"},
            new String[]{"What is prototypal inheritance in JavaScript?", "Medium", "Discuss __proto__, Object.create, class syntax.", "Objects inherit directly from other objects through the prototype chain. Object.create and class syntax are common patterns.", "prototype,chain,inherit,Object.create,class"},
            new String[]{"Explain closures with a practical use case.", "Medium", "Show data encapsulation or partial application.", "A closure is a function that retains access to its lexical scope even when executed outside that scope. Used for data privacy and partial application.", "lexical scope,function,access,privacy,encapsulation"});

        bank("React",
            new String[]{"Explain the React component lifecycle and hooks equivalent.", "Medium", "Map componentDidMount to useEffect.", "useEffect replaces componentDidMount/Update/Unmount. It runs side effects after render. The cleanup function handles unmounting.", "useEffect,componentDidMount,lifecycle,side effects,cleanup"},
            new String[]{"How does React's reconciliation algorithm work?", "Hard", "Discuss virtual DOM diffing, keys, fiber architecture.", "React uses virtual DOM diffing to find minimal changes. Keys help identify elements. Fiber architecture enables incremental rendering.", "virtual DOM,diffing,keys,fiber,incremental"},
            new String[]{"What is prop drilling and how do you solve it?", "Medium", "Mention Context API, state management libraries.", "Prop drilling passes props through intermediate components. Solutions include Context API, Redux, Zustand, or component composition.", "prop drilling,Context API,Redux,composition,state management"},
            new String[]{"Explain useCallback and useMemo — when to use each.", "Medium", "Referential equality and expensive computations.", "useCallback memoizes functions to maintain referential equality. useMemo memoizes computed values to avoid expensive recalculations.", "memoize,referential equality,useCallback,useMemo,expensive"},
            new String[]{"How would you optimize a React app with performance issues?", "Hard", "React.memo, lazy loading, code splitting, profiler.", "Use React.memo, useMemo, useCallback for unnecessary re-renders. Implement code splitting with lazy/Suspense. Use React Profiler to identify bottlenecks.", "React.memo,code splitting,lazy,Profiler,re-renders"});

        bank("SQL",
            new String[]{"Explain the difference between INNER JOIN, LEFT JOIN, and CROSS JOIN.", "Easy", "Use a practical example with two tables."},
            new String[]{"How do database indexes work and when should you create them?", "Medium", "B-tree indexes, query plans, trade-offs."},
            new String[]{"What is database normalization? Explain up to 3NF.", "Medium", "1NF, 2NF, 3NF with examples."},
            new String[]{"How would you optimize a slow SQL query?", "Hard", "EXPLAIN, indexes, query rewriting, partitioning."});

        bank("Spring Boot",
            new String[]{"How does dependency injection work in Spring?", "Medium", "Constructor vs field injection, IoC container."},
            new String[]{"Explain Spring Boot auto-configuration.", "Medium", "@ConditionalOnClass, META-INF/spring.factories."},
            new String[]{"How do you handle transactions in Spring?", "Hard", "@Transactional, propagation levels, rollback rules."},
            new String[]{"What is the difference between @Component, @Service, @Repository?", "Easy", "Semantic differences and exception translation."});

        bank("Docker",
            new String[]{"What is the difference between a Docker image and container?", "Easy", "Image = blueprint, container = running instance."},
            new String[]{"How does Docker networking work?", "Medium", "Bridge, host, overlay networks."},
            new String[]{"Explain multi-stage builds and why they matter.", "Medium", "Smaller images, separating build and runtime."});

        bank("AWS",
            new String[]{"Explain the difference between EC2, Lambda, and ECS.", "Medium", "VMs vs serverless vs containers."},
            new String[]{"How would you design a highly available application on AWS?", "Hard", "Multi-AZ, load balancers, auto-scaling, RDS replicas."},
            new String[]{"What is IAM and how do you manage permissions?", "Medium", "Users, roles, policies, least privilege."});

        bank("Machine Learning",
            new String[]{"Explain the bias-variance tradeoff.", "Medium", "Underfitting vs overfitting, model complexity."},
            new String[]{"What is cross-validation and why is it important?", "Medium", "K-fold, preventing overfitting, model evaluation."},
            new String[]{"How would you handle imbalanced datasets?", "Hard", "SMOTE, undersampling, class weights, metrics."});

        bank("Node.js",
            new String[]{"How does the Node.js event loop work?", "Medium", "Single-threaded, non-blocking I/O, libuv."},
            new String[]{"What is middleware in Express.js?", "Easy", "Request pipeline, next(), error handling."},
            new String[]{"How do you handle memory leaks in Node.js?", "Hard", "Heap snapshots, event listeners, streams."});

        bank("MongoDB",
            new String[]{"When would you choose MongoDB over a relational database?", "Medium", "Schema flexibility, document model, scaling."},
            new String[]{"Explain MongoDB aggregation pipeline.", "Hard", "$match, $group, $project, $lookup stages."});

        bank("Git",
            new String[]{"Explain git rebase vs git merge.", "Medium", "Linear history vs merge commits, when to use each."},
            new String[]{"How do you resolve merge conflicts?", "Easy", "Identify, edit, add, commit — tools and strategies."});

        bank("TypeScript",
            new String[]{"What are generics in TypeScript and when do you use them?", "Medium", "Type parameters, constraints, utility types."},
            new String[]{"Explain union types, intersection types, and type guards.", "Medium", "Practical examples of narrowing."});

        bank("Kubernetes",
            new String[]{"Explain Pods, Services, and Deployments in Kubernetes.", "Medium", "How they relate and their purposes."},
            new String[]{"How does Kubernetes handle scaling?", "Medium", "HPA, VPA, cluster autoscaler."});

        bank("Microservices",
            new String[]{"How do microservices communicate with each other?", "Medium", "REST, gRPC, message queues, event-driven."},
            new String[]{"What is the Circuit Breaker pattern?", "Medium", "Resilience4j, preventing cascade failures."});

        bank("REST API",
            new String[]{"How do you design a RESTful API?", "Medium", "Resource naming, HTTP methods, status codes, HATEOAS."},
            new String[]{"What is API versioning and how do you implement it?", "Easy", "URL path, header, query parameter approaches."});

        bank("CI/CD",
            new String[]{"Describe a typical CI/CD pipeline.", "Medium", "Build, test, deploy stages, tools like Jenkins/GitHub Actions."},
            new String[]{"How do you implement blue-green deployments?", "Hard", "Zero-downtime, traffic switching."});

        bank("Cybersecurity",
            new String[]{"What is the OWASP Top 10?", "Medium", "Common web vulnerabilities and mitigations."},
            new String[]{"Explain the difference between authentication and authorization.", "Easy", "Identity verification vs permission checking."});

        bank("Data Science",
            new String[]{"Walk me through your approach to a data science project.", "Medium", "EDA, cleaning, feature engineering, modeling, evaluation."},
            new String[]{"How do you choose the right ML algorithm for a problem?", "Hard", "Data type, size, interpretability, performance needs."});

        bank("Deep Learning",
            new String[]{"Explain backpropagation in neural networks.", "Hard", "Chain rule, gradient descent, weight updates."},
            new String[]{"What is the difference between CNN and RNN?", "Medium", "Spatial vs sequential data processing."});

        bank("GraphQL",
            new String[]{"How does GraphQL differ from REST?", "Medium", "Single endpoint, client-specified queries, schema."},
            new String[]{"What are resolvers in GraphQL?", "Easy", "Functions that provide data for schema fields."});

        bank("Redis",
            new String[]{"What are the main use cases for Redis?", "Easy", "Caching, sessions, pub/sub, rate limiting."},
            new String[]{"Explain Redis data structures.", "Medium", "Strings, lists, sets, sorted sets, hashes."});

        bank("Agile",
            new String[]{"Explain the Scrum framework and its ceremonies.", "Medium", "Sprint planning, daily standup, review, retrospective."},
            new String[]{"What is the role of a Product Owner?", "Easy", "Backlog management, prioritization, stakeholder communication."});

        bank("Angular",
            new String[]{"How does Angular's change detection work?", "Hard", "Zone.js, OnPush strategy, markForCheck."},
            new String[]{"Explain Angular dependency injection.", "Medium", "Providers, injectors, hierarchical DI."});

        bank("Next.js",
            new String[]{"Explain SSR vs SSG vs ISR in Next.js.", "Medium", "getServerSideProps, getStaticProps, revalidate."},
            new String[]{"How does Next.js handle routing?", "Easy", "File-based routing, dynamic routes, catch-all."});

        bank("Flutter",
            new String[]{"How does Flutter's widget tree work?", "Medium", "StatelessWidget vs StatefulWidget, rebuild."},
            new String[]{"Explain the Dart event loop.", "Medium", "Isolates, microtask queue, event queue."});

        bank("PostgreSQL",
            new String[]{"What are PostgreSQL's advanced features over MySQL?", "Medium", "JSONB, CTEs, window functions, full-text search."},
            new String[]{"Explain MVCC in PostgreSQL.", "Hard", "Multiversion concurrency control, transaction isolation."});

        bank("Linux",
            new String[]{"How do Linux file permissions work?", "Easy", "rwx, chmod, chown, user/group/other."},
            new String[]{"Explain the Linux boot process.", "Hard", "BIOS, bootloader, kernel, init/systemd."});

        bank("TensorFlow",
            new String[]{"How do you build and train a model in TensorFlow?", "Medium", "Sequential/Functional API, compile, fit, evaluate."});

        bank("PyTorch",
            new String[]{"How does autograd work in PyTorch?", "Medium", "Computational graph, backward(), gradient accumulation."});

        bank("Pandas",
            new String[]{"How do you handle missing data in Pandas?", "Easy", "dropna, fillna, interpolation strategies."});

        bank("Firebase",
            new String[]{"What Firebase services would you use for a real-time app?", "Medium", "Firestore, Realtime Database, Auth, Cloud Functions."});

        bank("Elasticsearch",
            new String[]{"How does Elasticsearch indexing work?", "Medium", "Inverted index, analyzers, mappings."});

        bank("HTML",
            new String[]{"What are semantic HTML elements and why do they matter?", "Easy", "header, nav, main, article — SEO and accessibility."});

        bank("CSS",
            new String[]{"Explain CSS Grid vs Flexbox — when to use which?", "Medium", "2D vs 1D layout, practical use cases."});

        bank("C++",
            new String[]{"What is RAII in C++?", "Medium", "Resource Acquisition Is Initialization, smart pointers."});

        bank("Go",
            new String[]{"How do channels work in Go?", "Medium", "Goroutine communication, buffered vs unbuffered."});

        bank("Rust",
            new String[]{"Explain ownership, borrowing, and lifetimes in Rust.", "Hard", "Move semantics, references, borrow checker."});

        bank("Vue.js",
            new String[]{"Explain Vue's reactivity system.", "Medium", "Proxy-based, ref, reactive, computed, watch."});

        bank("Django",
            new String[]{"How does Django ORM work?", "Medium", "Models, querysets, migrations, N+1 problem."});

        bank("Flask",
            new String[]{"How do you structure a large Flask application?", "Medium", "Blueprints, factory pattern, extensions."});

        bank("Express.js",
            new String[]{"How do you handle errors in Express.js?", "Easy", "Error middleware, async error handling, try-catch."});

        bank("Kotlin",
            new String[]{"What are coroutines in Kotlin?", "Medium", "Lightweight threads, suspend functions, structured concurrency."});

        bank("Swift",
            new String[]{"Explain optionals in Swift.", "Easy", "nil safety, unwrapping, guard let, if let."});

        bank("PHP",
            new String[]{"How does PHP handle sessions?", "Easy", "session_start, $_SESSION, cookies, server storage."});

        bank("Ruby",
            new String[]{"Explain the MVC pattern in Ruby on Rails.", "Medium", "Models, views, controllers, convention over configuration."});

        bank("Terraform",
            new String[]{"What is Infrastructure as Code and how does Terraform implement it?", "Medium", "Declarative config, state management, providers."});

        bank("Jenkins",
            new String[]{"How do you create a Jenkins pipeline?", "Medium", "Jenkinsfile, declarative vs scripted, stages."});
    }

    private static void bank(String skill, String[]... items) {
        BANK.put(skill, Arrays.asList(items));
    }

    /**
     * Generate interview questions for given skills.
     * Tries Gemini first, falls back to built-in bank.
     */
    public List<InterviewQuestion> generateForSkills(List<String> skills, int maxPerSkill) {
        // If Gemini API key is configured, use it
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                List<InterviewQuestion> aiQuestions = generateFromGemini(skills, maxPerSkill);
                if (!aiQuestions.isEmpty()) return aiQuestions;
            } catch (Exception e) {
                // Fall through to built-in bank
            }
        }

        // Fallback: built-in bank
        return generateFromBank(skills, maxPerSkill);
    }

    private List<InterviewQuestion> generateFromBank(List<String> skills, int max) {
        List<InterviewQuestion> result = new ArrayList<>();
        for (String skill : skills) {
            String key = BANK.keySet().stream()
                    .filter(k -> k.equalsIgnoreCase(skill)).findFirst().orElse(null);
            if (key != null) {
                List<String[]> pool = new ArrayList<>(BANK.get(key));
                Collections.shuffle(pool);
                for (int i = 0; i < Math.min(max, pool.size()); i++) {
                    String[] q = pool.get(i);
                    String expectedAnswer = q.length > 3 ? q[3] : "";
                    List<String> keywords = q.length > 4 && q[4] != null
                            ? Arrays.asList(q[4].split(","))
                            : List.of();
                    result.add(new InterviewQuestion(key, q[0], q[1], q[2], expectedAnswer, keywords));
                }
            } else {
                result.add(new InterviewQuestion(skill,
                    "Tell me about your experience with " + skill + " and how you've applied it in projects.",
                    "Medium", "Be specific — mention projects, tools, and outcomes.",
                    "Describe specific projects, technologies used, challenges faced, and measurable outcomes.",
                    List.of("project", "experience", "applied", "outcome", "challenge")));
            }
        }
        Collections.shuffle(result);
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<InterviewQuestion> generateFromGemini(List<String> skills, int max) {
        String skillList = String.join(", ", skills);
        String prompt = "Generate " + (max * skills.size()) + " interview questions for a candidate with skills in: " + skillList + ". " +
                "Mix difficulty levels (Easy, Medium, Hard). " +
                "Return ONLY a JSON array, each object: {\"skill\":\"...\",\"question\":\"...\",\"difficulty\":\"Easy|Medium|Hard\",\"tip\":\"...\"}. " +
                "No markdown fences, no extra text.";

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        Map<String, Object> resp = restTemplate.postForObject(GEMINI_URL + geminiApiKey, body, Map.class);
        if (resp == null) return List.of();

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) resp.get("candidates");
        if (candidates == null || candidates.isEmpty()) return List.of();

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        String text = ((String) parts.get(0).get("text"))
                .replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        List<Map<String, String>> items;
        try {
            items = mapper.readValue(text,
                    mapper.getTypeFactory().constructCollectionType(List.class, Map.class));
        } catch (Exception e) {
            return List.of();
        }

        return items.stream().map(m -> new InterviewQuestion(
                m.getOrDefault("skill", "General"),
                m.get("question"),
                m.getOrDefault("difficulty", "Medium"),
                m.getOrDefault("tip", "")
        )).collect(Collectors.toList());
    }
}
