// PLACIFY Placement Preparation Knowledge Base
export const PREPARATION_MODULES = [
  {
    id: 'aptitude',
    name: 'Aptitude & Reasoning',
    category: 'Aptitude',
    color: '#f59e0b',
    icon: 'Brain',
    description: 'Master quantitative aptitude shortcuts, logical deduction, and reasoning tricks tested in online screening rounds (TCS NQT, SHNOOR, Infosys, Google, Microsoft).',
    topicsCount: 6,
    topics: [
      {
        id: 'apt-1',
        title: 'Time, Speed & Distance & Trains',
        difficulty: 'MEDIUM',
        readTime: '10 min',
        overview: 'Core speed-distance-time relationships, relative speed between moving bodies, and train-platform crossing formulas.',
        formulas: [
          { name: 'Basic Formula', math: 'Speed = Distance / Time  |  1 km/hr = 5/18 m/s  |  1 m/s = 18/5 km/hr' },
          { name: 'Average Speed (Equal Distances)', math: 'Avg Speed = (2 * S1 * S2) / (S1 + S2)' },
          { name: 'Relative Speed', math: 'Opposite Direction: S_rel = S1 + S2\nSame Direction: S_rel = |S1 - S2|' },
          { name: 'Train Crossing a Platform / Bridge', math: 'Time = (Length of Train + Length of Platform) / Speed of Train' },
          { name: 'Boats & Streams', math: 'Downstream Speed = b + s\nUpstream Speed = b - s\nSpeed of Boat in Still Water = (Downstream + Upstream) / 2\nSpeed of Stream = (Downstream - Upstream) / 2' }
        ],
        keyConcepts: [
          'When distance is constant, Speed is inversely proportional to Time: S1/S2 = T2/T1.',
          'When time is constant, Distance is directly proportional to Speed: D1/D2 = S1/S2.',
          'Two trains starting at the same time from A & B meeting and taking t1 and t2 hours to reach destinations: S1/S2 = sqrt(t2/t1).'
        ],
        sampleQuestion: {
          problem: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
          solution: 'Speed of train = Length / Time = 240 m / 24 s = 10 m/s.\nTotal distance to pass platform = 240 m + 650 m = 890 m.\nTime taken = 890 m / 10 m/s = 89 seconds.'
        }
      },
      {
        id: 'apt-2',
        title: 'Time & Work, Pipes & Cisterns',
        difficulty: 'MEDIUM',
        readTime: '8 min',
        overview: 'Unitary work method, efficiency ratios, LCM method for multiple workers, and alternate-day tasks.',
        formulas: [
          { name: 'Work & Time Relation', math: 'If A can do a work in n days, A\'s 1 day work = 1/n\nTotal Work = Efficiency * Time' },
          { name: 'Men-Days-Hours Formula', math: '(M1 * D1 * H1 * E1) / W1 = (M2 * D2 * H2 * E2) / W2' },
          { name: 'Combined Work (LCM Method)', math: 'Total Work = LCM(time_A, time_B)\nEfficiency_A = Total Work / time_A\nCombined Time = Total Work / (Eff_A + Eff_B)' },
          { name: 'Pipes & Cisterns', math: 'Inlet pipe fills 1/x tank in 1 hr (positive efficiency)\nOutlet pipe empties 1/y tank in 1 hr (negative efficiency)\nNet filled in 1 hr = 1/x - 1/y' }
        ],
        keyConcepts: [
          'Efficiency is inversely proportional to time taken: If A is 3 times as efficient as B, Ratio of times = 1 : 3.',
          'When persons work on alternate days, find total work done in 1 cycle (2 days) and find nearest integer multiple of total units.'
        ],
        sampleQuestion: {
          problem: 'A can do a piece of work in 12 days and B in 18 days. If they work on it together for 4 days, what fraction of work is left?',
          solution: 'LCM(12, 18) = 36 units (Total Work).\nEfficiency: A = 3 units/day, B = 2 units/day. Combined = 5 units/day.\nIn 4 days, work done = 4 * 5 = 20 units.\nRemaining work = 36 - 20 = 16 units.\nFraction left = 16 / 36 = 4/9.'
        }
      },
      {
        id: 'apt-3',
        title: 'Percentages, Profit, Loss & Discount',
        difficulty: 'EASY',
        readTime: '7 min',
        overview: 'Commercial mathematics, percentage increments, marked price, trade discount, and false weights.',
        formulas: [
          { name: 'Profit & Loss %', math: 'Gain% = (Gain / CP) * 100\nLoss% = (Loss / CP) * 100\nSP = CP * (1 + Gain%/100) = CP * (1 - Loss%/100)' },
          { name: 'Successive Percentage Changes', math: 'Net % Change = a + b + (a * b) / 100' },
          { name: 'Marked Price & Discount', math: 'Discount = MP - SP\nDiscount % = (Discount / MP) * 100\nSP = MP * (1 - D1/100) * (1 - D2/100)' },
          { name: 'Dishonest Dealer / False Weights', math: 'Gain % = [ (Error) / (True Value - Error) ] * 100' }
        ],
        keyConcepts: [
          'Cost Price (CP) is always the base 100% unless specified otherwise.',
          'If two articles are sold at the same selling price with one at x% gain and other at x% loss, there is ALWAYS an overall loss = (x/10)*2 %.'
        ],
        sampleQuestion: {
          problem: 'A trader marks his goods at 20% above the cost price and allows a discount of 10%. What is his gain percent?',
          solution: 'Let CP = 100. MP = 120.\nDiscount = 10% of 120 = 12.\nSP = 120 - 12 = 108.\nGain % = 108 - 100 = 8%.'
        }
      },
      {
        id: 'apt-4',
        title: 'Permutations, Combinations & Probability',
        difficulty: 'HARD',
        readTime: '12 min',
        overview: 'Combinatorics counting rules, arrangements with repetitions, circular orderings, and probability distributions.',
        formulas: [
          { name: 'Permutation (Arrangement)', math: 'nPr = n! / (n - r)!\nPermutations with identical items: n! / (p! * q! * r!)' },
          { name: 'Combination (Selection)', math: 'nCr = n! / (r! * (n - r)!)\nnCr = nC(n - r)\nnC0 = nCn = 1' },
          { name: 'Circular Permutations', math: 'Distinct objects: (n - 1)!\nNecklace / Garland (clockwise = anti-clockwise): (n - 1)! / 2' },
          { name: 'Classical Probability', math: 'P(A) = Favorable Outcomes / Total Sample Space n(S)\nP(A U B) = P(A) + P(B) - P(A ∩ B)\nIndependent Events: P(A ∩ B) = P(A) * P(B)' }
        ],
        keyConcepts: [
          'Use Permutation when ORDER matters (e.g., words, seating arrangement, codes).',
          'Use Combination when GROUPING matters (e.g., team selection, handshakes, geometry lines/triangles).'
        ],
        sampleQuestion: {
          problem: 'In how many ways can 5 boys and 4 girls be seated in a row such that no two girls are adjacent?',
          solution: 'First seat 5 boys in 5! = 120 ways: _ B _ B _ B _ B _ B _\nThere are 6 available gaps for girls.\nSelect and arrange 4 girls in 6 gaps = 6P4 = 360.\nTotal ways = 120 * 360 = 43,200.'
        }
      },
      {
        id: 'apt-5',
        title: 'Logical Reasoning — Syllogisms & Venn Logic',
        difficulty: 'MEDIUM',
        readTime: '9 min',
        overview: 'Propositional logic, universal and particular statements, Venn mapping, and "Either-Or" complimentary pairs.',
        formulas: [
          { name: 'Standard Statements', math: 'A-Type: "All X are Y" (Universal Affirmative)\nE-Type: "No X is Y" (Universal Negative)\nI-Type: "Some X are Y" (Particular Affirmative)\nO-Type: "Some X are not Y" (Particular Negative)' },
          { name: 'Complementary Pairs (Either-Or)', math: '1. "Some" + "No"\n2. "All" + "Some Not"\n(Both conclusions must individually be false/uncertain in basic diagram)' }
        ],
        keyConcepts: [
          'A conclusion is valid ONLY if it holds true across ALL possible minimum and maximum Venn diagrams.',
          'Never assume real-world facts; strictly evaluate deductions from the given statements.'
        ],
        sampleQuestion: {
          problem: 'Statements: All Engineers are Innovators. Some Innovators are Scientists.\nConclusions: I. Some Engineers are Scientists. II. No Engineer is a Scientist.',
          solution: 'From basic Venn diagram, Scientist may or may not overlap Engineer. Neither is definitely true alone, but one must be true.\nAnswer: Either Conclusion I or II follows.'
        }
      },
      {
        id: 'apt-6',
        title: 'Blood Relations & Direction Sense',
        difficulty: 'EASY',
        readTime: '6 min',
        overview: 'Family generation diagrams, coded kinship relationships, 8-point compass navigation, and Pythagoras theorem in displacement.',
        formulas: [
          { name: 'Generation Levels', math: 'Level +2: Grandparents\nLevel +1: Parents, Uncles, Aunts\nLevel 0: Self, Siblings, Spouse, Cousins\nLevel -1: Children, Nephews, Nieces' },
          { name: 'Displacement Distance', math: 'Shortest Distance = sqrt( (Δx)^2 + (Δy)^2 )' }
        ],
        keyConcepts: [
          'Never assume a person\'s gender solely from their name unless explicitly given.',
          'For direction turns: Turning right from North is East; Turning left from North is West.'
        ],
        sampleQuestion: {
          problem: 'Pointing to a photograph, Madhu said, "She is the only daughter of my mother\'s only son." Who is the girl to Madhu?',
          solution: 'Madhu\'s mother\'s only son = Madhu himself.\nSo, the girl is Madhu\'s daughter.'
        }
      }
    ]
  },
  {
    id: 'java',
    name: 'Java & OOP Master Class',
    category: 'Java',
    color: '#6366f1',
    icon: 'Code2',
    description: 'Deep dive into Core Java, Memory Architecture, Concurrency, Collections internals, Streams API, and Spring Boot microservices design.',
    topicsCount: 5,
    topics: [
      {
        id: 'java-1',
        title: 'OOPs Principles & Modern Java Architecture',
        difficulty: 'MEDIUM',
        readTime: '12 min',
        overview: 'Encapsulation, Inheritance, Polymorphism, Abstraction, Interface default methods, and SOLID principles in Java.',
        formulas: [
          { name: '4 Core Pillars', math: '1. Encapsulation (Data hiding + getters/setters)\n2. Inheritance (extends / is-a relationship)\n3. Polymorphism (Compile-time overloading vs Runtime overriding)\n4. Abstraction (abstract classes & interfaces)' },
          { name: 'Method Overriding Rules', math: '1. Same method signature\n2. Return type must be same or covariant (subtype)\n3. Access modifier cannot be more restrictive\n4. Cannot override private, static, or final methods' }
        ],
        keyConcepts: [
          'Abstract Class vs Interface: Abstract class can hold state/constructors; Interface supports multiple inheritance and since Java 8 provides default/static implementations.',
          'Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering correctness.',
          'Composition over Inheritance: Favor "has-a" over "is-a" for flexible decoupled architecture.'
        ],
        sampleQuestion: {
          problem: 'Can we override a static method in Java?',
          solution: 'No. Static methods are bound at compile-time using Class reference (Method Hiding, not Dynamic Polymorphism).'
        }
      },
      {
        id: 'java-2',
        title: 'Collections Framework & HashMap Internals',
        difficulty: 'HARD',
        readTime: '15 min',
        overview: 'Internal mechanics of HashMap, ConcurrentHashMap, ArrayList resizing, TreeMap Red-Black balancing, and PriorityQueue.',
        formulas: [
          { name: 'HashMap Internal Thresholds', math: 'Initial Capacity = 16 (default)\nLoad Factor = 0.75\nThreshold = Capacity * Load Factor (12 by default)\nTreeify Threshold = 8 (converts LinkedList to Red-Black Tree)\nUntreeify Threshold = 6' },
          { name: 'Bucket Index Calculation', math: 'index = (n - 1) & hash(key)' }
        ],
        keyConcepts: [
          'equals() and hashCode() Contract: If two objects are equal by equals(), their hashCode() MUST be identical. If hashCodes are equal, objects are not necessarily equal (Collision).',
          'ConcurrentHashMap uses synchronized bucket locks + CAS (Compare-And-Swap) operations on node heads, eliminating table-wide locking.',
          'Fail-Fast vs Fail-Safe Iterators: ArrayList iterator throws ConcurrentModificationException (Fail-Fast); CopyOnWriteArrayList iterates over a snapshot (Fail-Safe).'
        ],
        sampleQuestion: {
          problem: 'What happens when two distinct keys produce the same bucket index in a Java 8 HashMap?',
          solution: 'A collision occurs. The entry is appended to a linked list at that bucket. When the list length reaches 8 and capacity >= 64, it transforms into a balanced Red-Black Tree providing O(log N) search.'
        }
      },
      {
        id: 'java-3',
        title: 'Multithreading, Concurrency & JVM Memory',
        difficulty: 'HARD',
        readTime: '18 min',
        overview: 'Thread lifecycle, synchronization, volatile keyword, locks, thread pools, and JVM Heap / Metaspace GC algorithms.',
        formulas: [
          { name: 'JVM Memory Regions', math: '1. Heap (Eden, Survivor S0/S1, Old Gen)\n2. Metaspace (Class metadata, static vars)\n3. JVM Stack (Per-thread frames, local vars)\n4. PC Register\n5. Native Method Stack' },
          { name: 'Volatile Keyword', math: 'Guarantees Memory Visibility across CPU cores + Prevents Instruction Reordering (Happens-Before Relationship). Does NOT guarantee atomicity for compound operations (e.g. count++).' }
        ],
        keyConcepts: [
          'ReentrantLock vs synchronized: ReentrantLock offers fairness policies, tryLock() timeouts, and interruptible locks.',
          'Garbage Collection Algorithms: Minor GC collects Young Gen; Major/Full GC cleans Old Gen. Modern JVMs use G1 (Garbage-First) or ZGC (ultra-low pause time).',
          'Deadlock 4 Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.'
        ],
        sampleQuestion: {
          problem: 'Why is volatile int counter = 0 not thread-safe for counter++?',
          solution: 'counter++ is a 3-step operation: (1) read, (2) modify, (3) write back. Volatile only guarantees visibility of single reads/writes. Use AtomicInteger.incrementAndGet() for atomic operations.'
        }
      },
      {
        id: 'java-4',
        title: 'Java 8+ Streams, Lambdas & Functional API',
        difficulty: 'MEDIUM',
        readTime: '10 min',
        overview: 'Functional interfaces, Stream pipeline processing, intermediate vs terminal operations, and parallel stream performance.',
        formulas: [
          { name: 'Key Functional Interfaces', math: 'Predicate<T>: boolean test(T t)\nFunction<T, R>: R apply(T t)\nConsumer<T>: void accept(T t)\nSupplier<T>: T get()\nBiFunction<T, U, R>: R apply(T t, U u)' }
        ],
        keyConcepts: [
          'Streams are lazy: Intermediate operations (filter, map, sorted) are not executed until a terminal operation (collect, forEach, reduce) is invoked.',
          'Stream vs Collection: Collections store data in memory; Streams compute data on-demand without mutating the source.',
          'Optional<T> prevents NullPointerExceptions by modeling nullable return values.'
        ],
        sampleQuestion: {
          problem: 'How to group a list of employees by department and calculate the average salary per department using Streams?',
          solution: 'Map<String, Double> avgSal = employees.stream()\n  .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.averagingDouble(Employee::getSalary)));'
        }
      },
      {
        id: 'java-5',
        title: 'Spring Boot Architecture & RESTful Microservices',
        difficulty: 'MEDIUM',
        readTime: '14 min',
        overview: 'Inversion of Control (IoC), Dependency Injection, Spring Bean Scopes, SecurityFilterChain, and Spring Data MongoDB / JPA.',
        formulas: [
          { name: 'Bean Lifecycles', math: 'Singleton (Default) -> Prototype -> Request -> Session -> Application' },
          { name: 'Core Annotations', math: '@RestController = @Controller + @ResponseBody\n@Service, @Repository, @Component\n@Autowired / Constructor Injection (Recommended)\n@Transactional (AOP-based rollbacks)' }
        ],
        keyConcepts: [
          'Spring Security FilterChain executes before requests reach DispatcherServlet, validating JWT tokens statelessly.',
          'Constructor Injection is preferred over field injection because it ensures immutability, facilitates unit testing, and prevents NullPointerExceptions.',
          'Spring Boot Auto-Configuration (@EnableAutoConfiguration) scans classpath JARs and creates beans automatically.'
        ],
        sampleQuestion: {
          problem: 'What is the role of DispatcherServlet in Spring MVC?',
          solution: 'It acts as the Front Controller design pattern, intercepting all HTTP requests, determining appropriate HandlerMappings, invoking Controllers, and converting return objects to JSON via HttpMessageConverter.'
        }
      }
    ]
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms (DSA)',
    category: 'DSA',
    color: '#06b6d4',
    icon: 'Network',
    description: 'Top coding patterns for product companies: Two-Pointer, Sliding Window, Monotonic Stacks, Binary Trees, Graphs, and Dynamic Programming.',
    topicsCount: 4,
    topics: [
      {
        id: 'dsa-1',
        title: 'Arrays, Two-Pointers & Sliding Window',
        difficulty: 'EASY',
        readTime: '10 min',
        overview: 'Optimizing O(N^2) brute forces into O(N) linear time using pointers and variable-length window bounds.',
        formulas: [
          { name: 'Two-Pointer Technique', math: 'Sorted Array: Left at 0, Right at n-1\nSum < Target => Left++\nSum > Target => Right--\nSum == Target => Pair found' },
          { name: 'Sliding Window Pattern', math: 'Expand window by moving `right` pointer and updating frequency/sum.\nWhile condition violated (e.g. sum > k or duplicate char), shrink from `left`.' }
        ],
        keyConcepts: [
          'Kadane\'s Algorithm for Max Subarray: current_sum = max(nums[i], current_sum + nums[i]); max_sum = max(max_sum, current_sum) in O(N) time.',
          'Prefix Sum Array allows answering range sum queries in O(1) time after O(N) precomputation.'
        ],
        sampleQuestion: {
          problem: 'Longest Substring Without Repeating Characters (LeetCode #3)',
          solution: 'Use HashMap<Character, Integer> to store last seen index.\n`left = max(left, map.get(ch) + 1)` whenever duplicate found inside window.'
        }
      },
      {
        id: 'dsa-2',
        title: 'Binary Trees & Binary Search Trees (BST)',
        difficulty: 'MEDIUM',
        readTime: '14 min',
        overview: 'Tree traversals, tree depth/diameter, Lowest Common Ancestor (LCA), and BST search properties.',
        formulas: [
          { name: 'Traversals', math: 'Inorder: Left -> Root -> Right (Yields sorted order in BST)\nPreorder: Root -> Left -> Right\nPostorder: Left -> Right -> Root\nLevel Order: Queue BFS' },
          { name: 'BST Property', math: 'For every node N: All keys in Left Subtree < N.key < All keys in Right Subtree' }
        ],
        keyConcepts: [
          'Height of Binary Tree = 1 + max(height(left), height(right)).',
          'Lowest Common Ancestor (LCA) in BST: If both p & q < root, go left; If both > root, go right; else root is LCA.'
        ],
        sampleQuestion: {
          problem: 'Validate if a given Binary Tree is a valid BST.',
          solution: 'Pass range boundaries: `isValid(node, min, max)` where `left child < node.val` and `right child > node.val` recursively.'
        }
      },
      {
        id: 'dsa-3',
        title: 'Dynamic Programming (DP) Core Patterns',
        difficulty: 'HARD',
        readTime: '20 min',
        overview: 'Optimal Substructure and Overlapping Subproblems, Top-Down Memoization vs Bottom-Up Tabulation.',
        formulas: [
          { name: '0/1 Knapsack State Transition', math: 'dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) if w >= wt[i-1]' },
          { name: 'Longest Common Subsequence (LCS)', math: 'If s1[i-1] == s2[j-1]: dp[i][j] = 1 + dp[i-1][j-1]\nElse: dp[i][j] = max(dp[i-1][j], dp[i][j-1])' }
        ],
        keyConcepts: [
          'Identify state variables (indices, remaining capacity, sum).',
          'Space optimization: If dp[i] only depends on dp[i-1], reduce 2D table into a 1D array.'
        ],
        sampleQuestion: {
          problem: 'Coin Change Problem: Find minimum coins to make target amount.',
          solution: '`dp[a] = min(dp[a], 1 + dp[a - coin])` for each coin in coins, initialized with infinity.'
        }
      },
      {
        id: 'dsa-4',
        title: 'Graphs, BFS/DFS & Shortest Paths',
        difficulty: 'HARD',
        readTime: '16 min',
        overview: 'Graph representations (Adjacency List), Cycle Detection, Topological Sort, and Dijkstra algorithm.',
        formulas: [
          { name: 'Dijkstra\'s Shortest Path', math: 'Time Complexity: O((V + E) * log V) using PriorityQueue (Min-Heap)\nRelaxation: if (dist[u] + weight < dist[v]) { dist[v] = dist[u] + weight; pq.push(v); }' },
          { name: 'Topological Sort (Kahn\'s BFS)', math: '1. Calculate in-degrees for all nodes\n2. Push nodes with in-degree == 0 into queue\n3. Pop node, reduce neighbor in-degrees, push when in-degree reaches 0' }
        ],
        keyConcepts: [
          'Cycle in Directed Graph: Use recursion stack array in DFS or check if Topo Sort order includes all V vertices.',
          'Disjoint Set Union (DSU / Union-Find): Provides near O(1) connectivity checking with Path Compression and Union by Rank.'
        ],
        sampleQuestion: {
          problem: 'Course Schedule (LeetCode #207): Can all courses be finished given prerequisite pairs?',
          solution: 'Model courses as directed edges. Build Kahn\'s in-degree graph. If topological sort visits all courses, return true (DAG), else false (Cycle exists).'
        }
      }
    ]
  },
  {
    id: 'dbms',
    name: 'DBMS & SQL Mastery',
    category: 'DBMS',
    color: '#10b981',
    icon: 'Database',
    description: 'Relational database architecture, ACID transactions, Normalization (1NF - BCNF), Indexing strategies, and advanced SQL window queries.',
    topicsCount: 3,
    topics: [
      {
        id: 'dbms-1',
        title: 'ACID Properties & Transaction Isolation',
        difficulty: 'MEDIUM',
        readTime: '11 min',
        overview: 'Atomicity, Consistency, Isolation levels, Dirty Reads, Non-repeatable reads, and 2-Phase Locking.',
        formulas: [
          { name: 'Isolation Levels & Anomalies', math: '1. Read Uncommitted: Dirty Read, Non-Repeatable Read, Phantom Read\n2. Read Committed: Prevents Dirty Read\n3. Repeatable Read (Default in MySQL): Prevents Non-Repeatable Read\n4. Serializable: Prevents all anomalies' }
        ],
        keyConcepts: [
          'WAL (Write-Ahead Logging): Changes are written to disk log before the actual data pages are flushed.',
          'Two-Phase Locking (2PL): Growing phase (acquire locks, release none) & Shrinking phase (release locks, acquire none) guarantees Serializability.'
        ],
        sampleQuestion: {
          problem: 'What is a Phantom Read anomaly?',
          solution: 'When Transaction A re-runs a range query (`SELECT WHERE age > 25`) and finds new rows inserted and committed by Transaction B in between.'
        }
      },
      {
        id: 'dbms-2',
        title: 'Normalization (1NF, 2NF, 3NF, BCNF)',
        difficulty: 'MEDIUM',
        readTime: '12 min',
        overview: 'Eliminating insertion, deletion, and update anomalies through functional dependency decomposition.',
        formulas: [
          { name: 'Normal Forms Summary', math: '1NF: Atomic column values (no multi-valued/composite attributes)\n2NF: 1NF + No Partial Dependency (all non-prime attributes depend on FULL candidate key)\n3NF: 2NF + No Transitive Dependency (X -> Y: X is super key OR Y is prime attribute)\nBCNF: For every functional dependency X -> Y, X MUST be a Super Key.' }
        ],
        keyConcepts: [
          'Lossless Join: Decomposing R into R1 and R2 is lossless if (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2.',
          'Dependency Preservation: All original functional dependencies can be enforced using decomposed tables without performing joins.'
        ],
        sampleQuestion: {
          problem: 'Given relation R(A, B, C, D) with F = {AB -> C, C -> D, D -> A}. Find candidate keys and highest normal form.',
          solution: 'Candidate keys are AB, BC, CD. In C -> D, C is not a super key, but D is a prime attribute (part of CD), so it satisfies 3NF, but violates BCNF.'
        }
      },
      {
        id: 'dbms-3',
        title: 'SQL Joins, Indexing & Window Functions',
        difficulty: 'EASY',
        readTime: '10 min',
        overview: 'Inner/Outer joins, B-Tree index structures, and ranking window functions for interview problem-solving.',
        formulas: [
          { name: 'Window Ranking Functions', math: 'ROW_NUMBER(): Sequential integers (1, 2, 3, 4)\nRANK(): Skips ranks on ties (1, 2, 2, 4)\nDENSE_RANK(): No skips on ties (1, 2, 2, 3)' }
        ],
        keyConcepts: [
          'B+ Tree Index: All data records/pointers reside at leaf nodes, linked in a sequential doubly-linked list for lightning-fast range scans.',
          'Clustered Index determines physical storage order of rows (Only 1 per table, typically Primary Key); Non-Clustered index stores pointers to rows.'
        ],
        sampleQuestion: {
          problem: 'Write SQL query to find the N-th highest salary from an Employee table.',
          solution: 'WITH RankedSalaries AS (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_num\n  FROM Employee\n)\nSELECT salary FROM RankedSalaries WHERE rank_num = N LIMIT 1;'
        }
      }
    ]
  }
];
