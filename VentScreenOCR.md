---
layout: default
title: "VentScreenOCR"
---
<h2>How Would a Computer Parse a Ventilator Screen?</h2>

<h3>Explore this below</h3>

Parsing a Ventilator screen can be tricky and is dependent on the maker and model number of the Mechanical Ventilator being used. Below is the PB840 Mechanical Ventilator.

<div style="text-align: center; margin: 20px 0;">
  <img src="/info/ventscreen/image.png" alt="Ventilator screen display" style="max-width: 100%; height: auto;">
  <p style="font-style: italic; margin-top: 8px;">Caption: This image shows a typical ventilator screen with various parameters displayed.</p>
</div>

The intake of this screen is varied and complex and requires a careful methodological approach:
- The screen contains graphics
- The screen contains numerics for data columns
- The screen has multiple menus and signals for alarms

Isolating the areas of interest is important when discussing this machine.

<div style="text-align: center; margin: 20px 0;">
  <img src="/info/ventscreen/contours_debug.png" alt="Ventilator screen display traced" style="max-width: 100%; height: auto;">
  <p style="font-style: italic; margin-top: 8px;">Caption: This image shows a typical ventilator screen with various parameters displayed and then traced by a Python library.</p>
</div>

Here, we traced the outlines of the data on the mechanical ventilator in green:
- We can see that there appears to be dark areas between the groupings in the areas in green
- A top, middle and bottom section are immediately available
- The bottom section has a blank area where values sometimes appear that are related to other items in the bottom section

<div style="text-align: center; margin: 20px 0;">
  <img src="/info/ventscreen/top_section.png" alt="Ventilator screen display top section" style="max-width: 100%; height: auto;">
  <p style="font-style: italic; margin-top: 8px;">Caption: This image shows a typical ventilator screen with various parameters displayed but only the top section.</p>
</div>

The top section is isolated here:
- A giant letter signifies the classification of the breath as either assisted, synchronized or spontaneous. I forget if other values exist
- Text above values signify what the data value represents (PPeak aka Peak Inspiratory Pressure)
- Each value omits its unit of measurement, preexisiting knowledge of the unit of measurement is needed

<div style="text-align: center; margin: 20px 0;">
  <img src="/info/ventscreen/middle_section.png" alt="Ventilator screen display middle section" style="max-width: 100%; height: auto;">
  <p style="font-style: italic; margin-top: 8px;">Caption: This image shows a typical ventilator screen with various parameters displayed but only the middle section.</p>
</div>

The middle section composes the graphics:
- Two Graphics are present here but 5 exist in common usage [VT/Pressure/Flow vs. Time, PV Loop and FV Loop)
- Scaling is manually done to display the graphics
- Improper scaling or abnormalities in the graphics indicates problems with the system

<div style="text-align: center; margin: 20px 0;">
  <img src="/info/ventscreen/bottom_section.png" alt="Ventilator screen display bottom section" style="max-width: 100%; height: auto;">
  <p style="font-style: italic; margin-top: 8px;">Caption: This image shows a typical ventilator screen with various parameters displayed but only the bottom section.</p>
</div>

The bottom section comprises the settings input by the pracitioner and any associated information for a value:
- Each mode of ventilation may use a different input selection scheme, there are templates worth remembering
- Equivalent modes of ventilation on other machines will be labeled differently
- Additional measurements that show up are sometimes diagnostic related
