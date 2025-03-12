document.addEventListener("DOMContentLoaded", function () {
    const postsContainer = document.getElementById("posts");
    const userModal = document.getElementById("userModal");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.querySelector(".close");
    const contactForm = document.getElementById("contactForm");
    const sendBtn = document.getElementById("contactSub");


    let postLimit = 5;
    let postSkip = 0;
    let allPostsLoaded = false;
    let usersCache = {}; // Store user data to prevent duplicate API calls

    if (postsContainer) {
        loadPosts();
        window.addEventListener("scroll", handleScroll);
    }
   if (sendBtn) {
        sendBtn.addEventListener("click", handleContactSubmission);
    }
    
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            userModal.style.display = "none";
        });
    }

    if (contactSub) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent form submission to allow validation
            handleContactSubmission();
        });
    }
 

    async function loadPosts() {
        if (allPostsLoaded) return;

        const POSTS_API = `https://dummyjson.com/posts?limit=${postLimit}&skip=${postSkip}`;
        try {
            const response = await fetch(POSTS_API);
            const data = await response.json();

            if (!data.posts || data.posts.length === 0) {
                allPostsLoaded = true;
                postsContainer.innerHTML += "<p>No more posts available.</p>";
                return;
            }

            displayPosts(data.posts);
            postSkip += postLimit;
        } catch (error) {
            console.error("Error fetching posts:", error);
            postsContainer.innerHTML = "<p>Failed to load posts.</p>";
        }
    }

    async function displayPosts(posts) {
        for (let post of posts) {
            const user = await fetchUser(post.userId);
            const comments = await fetchComments(post.id);

            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.body}</p>
                <p><strong>By:</strong> <a href="#" class="user-link" data-userid="${post.userId}">${user.username}</a></p>
                <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
                <p><strong>Reactions:</strong> ${post.reactions}</p>
                <h3>Comments:</h3>
                <ul>
                    ${comments.length > 0 ? comments.map(c => `<li>${c.body} - <strong>${c.user.username}</strong></li>`).join("") : "<li>No comments yet.</li>"}
                </ul>
            `;

            postsContainer.appendChild(postElement);
        }

        document.querySelectorAll(".user-link").forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                const userId = this.dataset.userid;
                showUserProfile(userId);
            });
        });
    }

    async function fetchUser(userId) {
        if (usersCache[userId]) {
            return usersCache[userId];
        }

        try {
            const response = await fetch(`https://dummyjson.com/users/${userId}`);
            const user = await response.json();
            usersCache[userId] = user; // Store user in cache
            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            return { username: "Unknown User" };
        }
    }

    async function fetchComments(postId) {
        try {
            const response = await fetch(`https://dummyjson.com/comments/post/${postId}`);
            const data = await response.json();
            return data.comments || [];
        } catch (error) {
            console.error("Error fetching comments:", error);
            return [];
        }
    }

    function showUserProfile(userId) {
        const user = usersCache[userId] || {}; // Fallback to an empty object if not cached

        modalBody.innerHTML = `
            <h2>${user.username || 'Unknown User'}</h2>
            <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
            <p><strong>Email:</strong> ${user.email || ''}</p>
            <p><strong>Phone:</strong> ${user.phone || ''}</p>
            <p><strong>Company:</strong> ${user.company?.name || ''}</p>
            <p><strong>Address:</strong> ${user.address?.address || ''}, ${user.address?.city || ''}, ${user.address?.state || ''}</p>
            <p><strong>Gender:</strong> ${user.gender || ''}</p>
            <p><strong>Birth Date:</strong> ${user.birthDate || ''}</p>
        `;

        userModal.style.display = "block";
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadPosts();
        }
    }

    function handleContactSubmission() {
        const name = document.getElementById("myName").value.trim();
        const email = document.getElementById("myEmail").value.trim();
        const message = document.getElementById("submission").value.trim();
        const checkbox = document.getElementById("checkbox");

        if (!name || /\d/.test(name)) {
            alert("Please enter a valid name (no numbers allowed).");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            alert("Please enter a valid email address.");
            return;
        }
        if (!message) {
            alert("Message cannot be empty.");
            return;
        }
        if (!checkbox.checked) {
            alert("Please confirm your details before submitting!");
            return;
        }
        
    

        alert(`Thank you, ${name}! We will get back to you at ${email}.`);
        document.getElementById("myName").value = "";
        document.getElementById("myEmail").value = "";
        document.getElementById("submission").value = "";
        checkbox.checked = false;

    }

});
