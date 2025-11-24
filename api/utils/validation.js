// validation.js
const validate = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.body);

	if (error) {
		const errorMessage = error.details
			.map((detail) => detail.message)
			.join(", ");
		// Return a 400 Bad Request
		return res.status(400).json({
			error: "Validation failed",
			details: errorMessage,
		});
	}

	req.body = value;
	next();
};

export default validate;
