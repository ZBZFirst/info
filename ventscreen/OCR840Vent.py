import cv2
import pytesseract
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt  # For displaying images (optional)

# Set Tesseract path 
pytesseract.pytesseract.tesseract_cmd = r'C:/folder-path/path-to-tesseract.exe'  # Windows - fuck you

def load_and_test_image(image_path):
    # --- 1. Test Image Loading ---
    print("\n=== Testing Image Load ===")
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise FileNotFoundError
        print(f"✅ Image loaded successfully. Shape: {img.shape}")
    except Exception as e:
        print(f"❌ Failed to load image: {e}")
        return

    # --- 2. Test OpenCV Processing ---
    print("\n=== Testing OpenCV ===")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    print("✅ Grayscale and thresholding applied.")

    # --- 3. Test Contour Detection ---
    print("\n=== Testing Contour Detection ===")
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    print(f"✅ Found {len(contours)} contours.")

    # Draw contours (for visualization)
    contour_img = img.copy()
    cv2.drawContours(contour_img, contours, -1, (0, 255, 0), 2)
    cv2.imwrite("contours_debug.jpg", contour_img)
    print("⚠️ Saved contour debug image as 'contours_debug.jpg'.")

    # --- 4. Test OCR (Tesseract) ---
    print("\n=== Testing Tesseract OCR ===")
    try:
        # Extract text from the entire image (crude test)
        text = pytesseract.image_to_string(img)
        print("✅ OCR extracted text (sample):")
        print(text[:100] + "...")  # Print first 100 chars
    except Exception as e:
        print(f"❌ OCR failed: {e}")

    # --- 5. Test Section Detection ---
    print("\n=== Testing Section Detection ===")
    height, width = img.shape[:2]
    top_section = img[0:height//3, :]  # Top 1/3 of image
    middle_section = img[height//3:2*height//3, :]
    bottom_section = img[2*height//3:, :]

    # Save sections to see how you did you fuck up
    cv2.imwrite("top_section.jpg", top_section)
    cv2.imwrite("middle_section.jpg", middle_section)
    cv2.imwrite("bottom_section.jpg", bottom_section)
    print("⚠️ Saved section debug images (top/middle/bottom).")

    # --- 6. Test DataFrame Creation ---
    print("\n=== Testing DataFrame ===")
    try:
        import pandas as pd
        test_df = pd.DataFrame({"Test": ["OK"]})
        print("✅ Pandas DataFrame test:")
        print(test_df)
    except Exception as e:
        print(f"❌ Pandas failed: {e}")

    print("\n=== Tests Complete ===")

# Run the test
image_path = "image.png"  # i left it literally as if a download. good luck.
load_and_test_image(image_path)
