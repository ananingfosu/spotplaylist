document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const appContent = document.getElementById('app-content');
    const artistInput = document.getElementById('artist-input');
    const generatePlaylistButton = document.getElementById('generate-playlist-button');
    const messageElement = document.getElementById('message');

    const CLIENT_ID = 'YOUR_CLIENT_ID'; // Replace with your Spotify Client ID
    const REDIRECT_URI = 'http://localhost:3000/callback'; // Must match your Spotify app settings
    const SCOPES = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private'];

    let accessToken = '';
    let userId = '';

    // Handle Spotify OAuth Callback
    const handleCallback = () => {
        const params = new URLSearchParams(window.location.hash.substring(1));
        accessToken = params.get('access_token');

        if (accessToken) {
            localStorage.setItem('spotify_access_token', accessToken);
            window.history.pushState({}, document.title, "/"); // Clean the URL
            initApp();
        } else {
            messageElement.textContent = 'Spotify login failed. Please try again.';
            loginButton.style.display = 'block';
            appContent.style.display = 'none';
        }
    };

    // Initialize the app after login or if token exists
    const initApp = async () => {
        accessToken = localStorage.getItem('spotify_access_token');
        if (accessToken) {
            loginButton.style.display = 'none';
            appContent.style.display = 'block';
            try {
                userId = await getUserId(accessToken);
                messageElement.textContent = `Welcome! You are logged in.`;
            } catch (error) {
                console.error('Error getting user ID:', error);
                messageElement.textContent = 'Could not retrieve user information. Please log in again.';
                localStorage.removeItem('spotify_access_token');
                loginButton.style.display = 'block';
                appContent.style.display = 'none';
            }
        } else {
            loginButton.style.display = 'block';
            appContent.style.display = 'none';
        }
    };

    // Redirect to Spotify for login
    loginButton.addEventListener('click', () => {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}&response_type=token`;
        window.location = authUrl;
    });

    // Get User ID
    async function getUserId(token) {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.id;
    }

    // Search for an artist
    async function searchArtist(artistName, token) {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.artists.items[0]?.id;
    }

    // Get top tracks for an artist
    async function getArtistTopTracks(artistId, token) {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.tracks;
    }

    // Create a playlist
    async function createPlaylist(userId, token, name, description) {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                description: description,
                public: true
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.id;
    }

    // Add tracks to a playlist
    async function addTracksToPlaylist(playlistId, token, trackUris) {
        const response = await fetch(`https://api.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: trackUris })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Generate playlist button click handler
    generatePlaylistButton.addEventListener('click', async () => {
        const artistNames = artistInput.value.split(',').map(name => name.trim()).filter(name => name.length > 0);
        if (artistNames.length === 0) {
            messageElement.textContent = 'Please enter at least one artist name.';
            return;
        }

        messageElement.textContent = 'Generating playlist...';
        let allTrackUris = [];

        try {
            for (const artistName of artistNames) {
                const artistId = await searchArtist(artistName, accessToken);
                if (artistId) {
                    const tracks = await getArtistTopTracks(artistId, accessToken);
                    allTrackUris = allTrackUris.concat(tracks.map(track => track.uri));
                } else {
                    messageElement.textContent = `Could not find artist: ${artistName}`;
                    return;
                }
            }

            if (allTrackUris.length > 0) {
                const playlistName = `Playlist for ${artistNames.join(', ')}`;
                const playlistDescription = `Generated by Spotify Playlist Generator for artists: ${artistNames.join(', ')}.`;
                const newPlaylistId = await createPlaylist(userId, accessToken, playlistName, playlistDescription);
                await addTracksToPlaylist(newPlaylistId, accessToken, allTrackUris);
                messageElement.textContent = `Playlist "${playlistName}" created successfully! Check your Spotify account.`;
            } else {
                messageElement.textContent = 'No tracks found for the given artists.';
            }
        } catch (error) {
            console.error('Error generating playlist:', error);
            messageElement.textContent = `Error generating playlist: ${error.message}. Please ensure your Client ID and Redirect URI are correct and you have granted necessary permissions.`;
        }
    });

    // Initial app load check
    handleCallback();
});