---
layout: default
title: Shape Animation Demo
---

{% include animated-shapes.html %}

<div style="margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 5px;">
    <h3>Animation Controls</h3>
    <button onclick="initShapeAnimation()">Restart Animation</button>
    <button onclick="document.querySelectorAll('.animated-shape').forEach(el => el.style.animationPlayState = 
        (el.style.animationPlayState === 'paused' ? 'running' : 'paused'))">
        Toggle Pause
    </button>
</div>

<h3>How to Reuse This Animation</h3>
<p>Add to any Markdown file with:</p>
<pre>{% raw %}{% include animated-shapes.html %}{% endraw %}</pre>
