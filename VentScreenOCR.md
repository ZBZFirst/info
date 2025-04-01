---
layout: default
title: Ventilator Screen OCR Parser
permalink: /VentScreenOCR/
---

<style>
    .vent-content {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
    }
    .vent-content h1, 
    .vent-content h2 {
        color: #2c3e50;
    }
    .vent-content code {
        background: #f4f4f4;
        padding: 2px 5px;
        border-radius: 3px;
        font-family: monospace;
    }
    .vent-content pre {
        background: #f8f8f8;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
    }
    .vent-content img {
        max-width: 100%;
        border: 1px solid #ddd;
        margin: 10px 0;
    }
    .img-caption {
        text-align: center;
        font-style: italic;
        color: #666;
    }
    .section {
        margin-bottom: 30px;
    }
    .image-grid {
        display: flex;
        flex-wrap: wrap;
        margin: 15px 0;
    }
    .image-half {
        flex: 1 1 50%;
        padding: 5px;
        box-sizing: border-box;
    }
</style>

<div class="vent-content">
    <h1>Ventilator Screen OCR Parser - Experimental Work In Progress</h1>
    <p>Python tool to extract structured data from ventilator screen images using OpenCV and Tesseract OCR.</p>

    <div class="section">
        <h2>Project Overview</h2>
        <p>This script processes ventilator screen captures to extract:</p>
        <ul>
            <li>Top section: Large header letter (e.g., "ME") and parameter values</li>
            <li>Middle section: Tables/graphs or annotations</li>
            <li>Bottom section: Nested configuration values and buttons</li>
        </ul>
        <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/image.png" alt="Sample ventilator screen">
        <p class="img-caption">Figure 1: Example ventilator screen input</p>
    </div>

    <div class="section">
        <h2>Key Features</h2>
        <ul>
            <li><strong>Adaptive Thresholding:</strong> Handles varying screen contrasts</li>
            <li><strong>Projection Profiling:</strong> Dynamically detects screen sections</li>
            <li><strong>Error Resilience:</strong> Handles empty regions gracefully</li>
        </ul>
    </div>

    <div class="section">
        <h2>How It Works</h2>
        <h3>1. Image Preprocessing</h3>
        <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/contours_debug.jpg" alt="Thresholding example">
        <p class="img-caption">Figure 2: Adaptive thresholding applied to raw image</p>
        <pre><code>def preprocess_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                               cv2.THRESH_BINARY_INV, 11, 2)</code></pre>

        <h3>2. Top Section Detection</h3>
        <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/top_section.jpg" alt="Top section extraction">
        <p class="img-caption">Figure 3: Isolated top section with header and values</p>
        <pre><code>def find_top_section(img, thresh):
    horizontal_proj = np.sum(thresh, axis=1)
    text_rows = np.where(horizontal_proj > 0)[0]
    return img[text_rows[0]:text_rows[-1]+1, :]</code></pre>

        <h3>3. Middle/Bottom Section Parsing</h3>
        <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/middle_section.jpg" alt="Middle section">
        <p class="img-caption">Figure 4: Extracted middle section with table data</p>
    </div>

    <div class="section">
        <h2>Installation</h2>
        <pre><code># Install dependencies
pip install opencv-python pytesseract numpy pillow

# Download Tesseract-OCR
# Windows: https://github.com/UB-Mannheim/tesseract/wiki
# Mac: brew install tesseract</code></pre>
    </div>

    <div class="section">
        <h2>Usage</h2>
        <pre><code>python vent_ocr.py --image ventilator_screen.png</code></pre>
        <p>Example output:</p>
        <pre>Top Letter: ME
Top Values: {
    "P_TEM": 24,
    "P_MEAN": 90,
    "PEEP": 49
}
Middle Section: [Table data...]</pre>
    </div>

    <div class="section">
        <h2>Debugging Outputs</h2>
        <p>The script generates these debug images:</p>
        <div class="image-grid">
            <div class="image-half">
                <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/contours_debug.jpg" alt="Contour detection">
                <p class="img-caption">Figure 5: Contour detection</p>
            </div>
            <div class="image-half">
                <img src="https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/ventscreen/bottom_section.jpg" alt="Bottom section">
                <p class="img-caption">Figure 6: Bottom section analysis</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Limitations</h2>
        <ul>
            <li>Requires clear screen captures (no motion blur)</li>
            <li>Font variations may affect OCR accuracy</li>
            <li>Tested on Windows/Mac - Linux may need path adjustments</li>
        </ul>
    </div>

    <div class="section">
        <p>Project repository: <a href="https://github.com/ZBZFirst/info">github.com/ZBZFirst/info</a></p>
    </div>
</div>
