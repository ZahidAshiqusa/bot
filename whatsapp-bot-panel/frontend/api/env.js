/**
 * Vercel Serverless Function: Environment Provider
 * Reads RENDER_BACKEND_URL, RENDER_EXTERNAL_URL, RAILWAY_BACKEND_URL, GOOGLE_CLIENT_ID, and Cloud integrations
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Prioritize Render backend URL, with fallback to Railway or generic BACKEND_URL
  const backendUrl = process.env.RENDER_BACKEND_URL || 
                     process.env.RENDER_EXTERNAL_URL || 
                     process.env.RAILWAY_BACKEND_URL || 
                     process.env.BACKEND_URL || '';
                     
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const cloudinaryConfigured = !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
  const githubBackupConfigured = !!process.env.GITHUB_TOKEN;
  const provider = (process.env.RENDER_BACKEND_URL || process.env.RENDER_EXTERNAL_URL) ? 'render' : 
                   (process.env.RAILWAY_BACKEND_URL ? 'railway' : 'custom');

  return res.status(200).json({
    success: true,
    backendUrl: backendUrl.trim().replace(/\/+$/, ''),
    googleClientId: googleClientId.trim(),
    cloudinaryConfigured,
    githubBackupConfigured,
    provider,
    source: 'vercel_environment_variables'
  });
};
