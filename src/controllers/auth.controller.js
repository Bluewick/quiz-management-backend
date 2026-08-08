import { loginService, signupService } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const user = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const user = await signupService(req.body);

    return res.status(201).json({
      success: true,
      message: "Sign up Successful",
      data: user,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
