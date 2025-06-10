const settings = window.settings || {};

// Initial blog posts (static data)
let blogPosts = [
    {
        id: "1",
        title: "The Future of AI in 2025",
        category: "Artificial Intelligence",
        date: "Jan 15, 2025",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        content: `
            <h2>Introduction to AI Trends</h2>
            <p>Artificial Intelligence in 2025 is reshaping industries with unprecedented advancements in generative models, ethical frameworks, and automation. From healthcare to finance, AI is driving innovation at scale.</p>
            <h3>Key Developments</h3>
            <ul>
                <li><strong>Generative AI:</strong> Tools like Grok 3 are creating hyper-realistic content, from text to visuals, revolutionizing creative industries.</li>
                <li><strong>AI Ethics:</strong> Global regulations are emphasizing transparency and fairness in AI deployment.</li>
                <li><strong>Automation:</strong> AI-driven systems are optimizing workflows, reducing costs, and enhancing productivity across sectors.</li>
            </ul>
            <h3>Real-World Impact</h3>
            <p>AI is enabling breakthroughs in personalized medicine, predictive analytics for finance, and sustainable supply chain management. Companies are leveraging AI to stay competitive while addressing ethical concerns.</p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/5a9f0eIVhF0" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>The AI landscape in 2025 is dynamic and transformative, blending innovation with responsibility to shape a future where technology serves humanity.</p>
        `,
        excerpt: "AI in 2025 is driving innovation across industries with advanced generative models, ethical frameworks, and automation.",
        lastModified: "2025-01-15T10:00:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "2",
        title: "The Impact of Quantum Computing in 2025",
        category: "Gadgets & Tech",
        date: "June 04, 2025",
        readTime: "6 min read",
        image: "https://imageio.forbes.com/specials-images/imageserve/63c9ca0a5317481ef6922d8b/0x0.jpg?format=jpg&height=900&width=1600&fit=bounds",
        content: `
            <h2>Introduction to Quantum Computing</h2>
            <p>Quantum computing is revolutionizing technology in 2025, offering unparalleled computational power to tackle complex problems beyond classical computers’ capabilities.</p>
            <h3>Key Advancements</h3>
            <ul>
                <li><strong>Quantum Supremacy:</strong> Quantum systems are solving previously intractable problems with speed and efficiency.</li>
                <li><strong>Industry Applications:</strong> Cryptography, drug discovery, and financial modeling are seeing transformative changes.</li>
                <li><strong>Scalability:</strong> Improvements in qubit stability and error correction are making quantum systems more practical.</li>
            </ul>
            <h3>Real-World Impact</h3>
            <p>Quantum computing is accelerating simulations in material science, optimizing global supply chains, and enhancing AI model training. Companies like IBM and Google are making quantum platforms more accessible.</p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/G9MqY70Dcuc" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>Quantum computing in 2025 is unlocking new possibilities, driving innovation across industries while paving the way for future technological breakthroughs.</p>
        `,
        excerpt: "Quantum computing in 2025 is transforming industries with breakthroughs in computational power and scalability.",
        lastModified: "2025-06-04T00:11:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "3",
        title: "Graphic Design Trends for 2025",
        category: "Graphic Design",
        date: "June 04, 2025",
        readTime: "7 min read",
        image: "https://www.simplilearn.com/ice9/free_resources_article_thumb/mobile_app_development_tools.jpg",
        content: `
            <h2>Introduction to Graphic Design Trends</h2>
            <p>In 2025, graphic design blends cutting-edge technology with creative expression to captivate audiences and enhance brand storytelling.</p>
            <h3>Key Trends</h3>
            <ul>
                <li><strong>Minimalism Evolved:</strong> Clean designs with subtle animations create engaging, uncluttered experiences.</li>
                <li><strong>3D and Immersive Elements:</strong> Hyper-realistic 3D visuals and AR integration add depth and interactivity.</li>
                <li><strong>Experimental Typography:</strong> Bold, kinetic fonts push creative boundaries.</li>
                <li><strong>AI-Enhanced Design:</strong> Generative AI tools streamline workflows and enable personalized visuals.</li>
                <li><strong>Sustainable Design:</strong> Eco-conscious aesthetics reflect a focus on sustainability.</li>
            </ul>
            <h3>Impact on Industries</h3>
            <p>Minimalist designs boost website engagement, 3D and AR transform e-commerce, and sustainable visuals align with consumer values.</p>
            <p><img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Graphic Design Example 2025"></p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/KFULlIuqcsA" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>The graphic design landscape in 2025 is vibrant, driven by technology and meaningful creativity.</p>
        `,
        excerpt: "Discover 2025’s top graphic design trends, from minimalism and 3D elements to AI tools and sustainable aesthetics.",
        lastModified: "2025-06-04T00:22:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "4",
        title: "AI-Driven Design Tools: Transforming Creativity in 2025",
        category: "Graphic Design",
        date: "June 04, 2025",
        readTime: "8 min read",
        image: "https://softbenz.com/media/blog/blog-1642056190.png",
        content: `
            <h2>Introduction to AI-Driven Design</h2>
            <p>AI is redefining graphic design in 2025 by enhancing efficiency, creativity, and accessibility with collaborative tools.</p>
            <h3>Popular AI Tools</h3>
            <ul>
                <li><strong>Canva AI:</strong> Magic Studio generates layouts and text, simplifying design for all skill levels.</li>
                <li><strong>Adobe Sensei:</strong> Powers Creative Cloud with intelligent automation like neural filters and auto-cropping.</li>
                <li><strong>Figma AI Plugins:</strong> Automator and Content Buddy enhance UI/UX design and mockup creation.</li>
                <li><strong>MidJourney:</strong> Generates photorealistic visuals from text prompts for bold concepts.</li>
                <li><strong>Runway ML:</strong> Excels in video editing with AI-driven features like motion tracking.</li>
            </ul>
            <h3>Benefits and Challenges</h3>
            <p>AI tools save time, personalize designs, and democratize creativity but raise concerns about originality and copyright.</p>
            <p><img src="https://www.zilliondesigns.com/blog/wp-content/uploads/Ecommerce-Business.png" alt="AI-Driven Design Example"></p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/9u9vW7W3i9k" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>AI-driven tools are transforming design in 2025, balancing efficiency with human ingenuity for innovative results.</p>
        `,
        excerpt: "AI-driven design tools in 2025 enhance efficiency and creativity with tools like Canva AI and Adobe Sensei.",
        lastModified: "2025-06-04T06:07:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "5",
        title: "Mobile App Development Tips for 2025",
        category: "Mobile Apps",
        date: "May 20, 2025",
        readTime: "7 min read",
        image: "https://www.wisestamp.com/wp-content/uploads/2022/12/mobile-app-development-companies.jpeg",
        content: `
            <h2>Introduction to Mobile App Development</h2>
            <p>Building mobile apps in 2025 demands innovation, user-centric design, and robust performance to stand out in a competitive market.</p>
            <h3>Best Practices</h3>
            <ul>
                <li><strong>UI/UX Design:</strong> Prioritize intuitive, accessible interfaces with seamless navigation.</li>
                <li><strong>Performance Optimization:</strong> Optimize for speed with efficient code and minimal resource usage.</li>
                <li><strong>Cross-Platform Development:</strong> Use frameworks like Flutter or React Native for broader reach.</li>
                <li><strong>Security:</strong> Implement end-to-end encryption and secure APIs to protect user data.</li>
            </ul>
            <h3>Trends to Watch</h3>
            <p>AI integration, AR features, and low-code platforms are shaping the future of mobile apps, enhancing user experiences.</p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/0-S5a0eKi7E" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>Successful mobile apps in 2025 combine innovative technology with user-focused design to deliver exceptional experiences.</p>
        `,
        excerpt: "Learn key tips for mobile app development in 2025, focusing on UI/UX, performance, and emerging trends like AI and AR.",
        lastModified: "2025-05-20T10:00:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "6",
        title: "Latest Gadgets of 2025",
        category: "Gadgets & Tech",
        date: "June 15, 2025",
        readTime: "6 min read",
        image: "https://media.assettype.com/analyticsinsight/2024-09-30/spwciswt/The-Most-Anticipated-Tech-Gadgets-of-2025.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true",
        content: `
            <h2>Tech Innovations in 2025</h2>
            <p>2025 introduces groundbreaking gadgets that blend functionality with futuristic design, transforming daily life.</p>
            <h3>Top Picks</h3>
            <ul>
                <li><strong>Smart Glasses:</strong> AR-enabled glasses offer immersive experiences for gaming and productivity.</li>
                <li><strong>Foldable Phones:</strong> Next-gen foldables combine portability with large, vibrant displays.</li>
                <li><strong>Wearable Health Tech:</strong> Devices monitor biometrics with AI-driven insights for wellness.</li>
            </ul>
            <h3>Impact on Consumers</h3>
            <p>These gadgets enhance connectivity, health monitoring, and entertainment, driving adoption across demographics.</p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/jTuHyikizdc" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>The gadget landscape in 2025 is vibrant, offering innovative solutions for modern challenges.</p>
        `,
        excerpt: "Explore 2025’s top gadgets, including AR smart glasses, foldable phones, and AI-driven wearables.",
        lastModified: "2025-06-15T10:00:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    },
    {
        id: "7",
        title: "Python for Data Science in 2025",
        category: "Programming",
        date: "July 10, 2025",
        readTime: "8 min read",
        image: "https://miro.medium.com/v2/resize:fit:1400/1*LxP1qwPjHE1CDFmLBh3bxQ.jpeg",
        content: `
            <h2>Python’s Role in Data Science</h2>
            <p>Python remains the cornerstone of data science in 2025, offering versatility and a robust ecosystem for analysis and visualization.</p>
            <h3>Key Libraries</h3>
            <ul>
                <li><strong>Pandas:</strong> Simplifies data manipulation and analysis with powerful data structures.</li>
                <li><strong>NumPy:</strong> Enables efficient numerical computing for large datasets.</li>
                <li><strong>Scikit-learn:</strong> Provides tools for machine learning and predictive modeling.</li>
                <li><strong>Matplotlib:</strong> Creates dynamic visualizations for data insights.</li>
            </ul>
            <h3>Applications</h3>
            <p>Python powers data-driven decisions in finance, healthcare, and marketing, with AI integration enhancing its capabilities.</p>
            <p><iframe width="560" height="315" src="https://www.youtube.com/embed/r-uOLxNrNk8" frameborder="0" allowfullscreen></iframe></p>
            <h3>Conclusion</h3>
            <p>Python’s dominance in data science continues, driven by its flexibility and extensive library support.</p>
        `,
        excerpt: "Python remains a top choice for data science in 2025, powered by libraries like Pandas and Scikit-learn.",
        lastModified: "2025-07-10T10:00:00Z",
        creator: {
            name: "SabirBlog Team",
            email: "",
            social: ""
        },
        links: []
    }
];

// Load user-submitted posts from localStorage
function loadPostsFromStorage() {
    try {
        const storedPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        // Validate and sanitize stored posts
        const validPosts = storedPosts.filter(post => {
            const errors = settings.validatePost ? settings.validatePost(post) : [];
            return errors.length === 0;
        });
        // Merge stored posts with static posts, avoiding duplicates
        validPosts.forEach(storedPost => {
            if (!blogPosts.some(post => post.id === storedPost.id)) {
                blogPosts.push({
                    ...storedPost,
                    content: settings.sanitizeContent ? settings.sanitizeContent(storedPost.content) : storedPost.content,
                    excerpt: settings.generateExcerpt ? settings.generateExcerpt(storedPost.content) : storedPost.excerpt,
                    lastModified: storedPost.lastModified || new Date().toISOString()
                });
            }
        });
    } catch (error) {
        console.error('Error loading posts from localStorage:', error);
    }
}

// Save posts to localStorage
function savePostsToStorage() {
    try {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts.filter(post => post.id > "7")));
    } catch (error) {
        console.error('Error saving posts to localStorage:', error);
        throw new Error('Failed to save post. Local storage may be full or another error occurred.');
    }
}

// Function to add a new post
function addPost(post) {
    // Validate required fields
    if (!post.title || !post.category || !post.content || !post.creator || !post.creator.name) {
        console.error('New post must include title, category, content, and creator name');
        return { success: false, errors: ['Missing required fields'] };
    }

    // Validate post using settings
    const errors = settings.validatePost ? settings.validatePost(post) : [];
    if (errors.length > 0) {
        console.error('Post validation failed:', errors);
        return { success: false, errors };
    }

    // Sanitize and prepare post data
    const newPost = {
        id: settings.generatePostId ? settings.generatePostId() : Date.now().toString(),
        title: settings.sanitizeContent ? settings.sanitizeContent(post.title) : post.title,
        category: settings.sanitizeContent ? settings.sanitizeContent(post.category) : post.category,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        readTime: settings.calculateReadTime ? settings.calculateReadTime(post.content) : '1 min read',
        image: post.image || settings.defaultPostImage || 'https://via.placeholder.com/800x400?text=No+Image',
        content: settings.sanitizeContent ? settings.sanitizeContent(post.content) : post.content,
        excerpt: settings.generateExcerpt ? settings.generateExcerpt(post.content) : post.excerpt || '',
        lastModified: new Date().toISOString(),
        creator: {
            name: settings.sanitizeContent ? settings.sanitizeContent(post.creator.name) : post.creator.name,
            email: settings.sanitizeContent ? settings.sanitizeContent(post.creator.email || '') : post.creator.email || '',
            social: settings.sanitizeContent ? settings.sanitizeContent(post.creator.social || '') : post.creator.social || ''
        },
        links: (post.links || []).map(link => settings.sanitizeContent ? settings.sanitizeContent(link) : link)
    };

    try {
        blogPosts.push(newPost);
        savePostsToStorage();
        return { success: true, post: newPost };
    } catch (error) {
        console.error('Error adding post:', error);
        return { success: false, errors: [error.message] };
    }
}

// Initialize posts from localStorage
loadPostsFromStorage();

// Ad data (unchanged)
const ads = [
    {
        id: "ad1",
        image: "https://marketplace.canva.com/EAGWVFch3bs/1/0/1600w/canva-product-launch-ad-facebook-post-MS83XQFecaA.jpg",
        alt: "Advertisement Banner"
    }
];

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
    module.exports = { blogPosts, ads, addPost, loadPostsFromStorage, savePostsToStorage };
} else {
    window.blogData = { blogPosts, ads, addPost, loadPostsFromStorage, savePostsToStorage };
}