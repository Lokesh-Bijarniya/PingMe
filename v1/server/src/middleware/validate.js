// middleware/validate.js
export const validateMessage = (req, res, next) => {
    if (!req.body.content || req.body.content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content required' });
    }
    next();
  };