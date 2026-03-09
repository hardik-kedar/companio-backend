import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("GLOBAL ERROR:", err);

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({
    message: err.message || "Something went wrong",
  });
};