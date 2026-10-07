export function requireRoles(...roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
		next();
	};
}
export { requireRoles } from "./authMiddleware.js";
