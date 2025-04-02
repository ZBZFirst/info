---
layout: default
title: "ABG Table - All Possible Value Pairs"
---

# ABG Value Table with Classifications

This table shows all possible combinations of PaCO₂ (10-100 mmHg) and HCO₃⁻ (5-50 mEq/L) with their calculated pH values and classifications.

<div class="table-container">
    <table id="abg-table">
        <thead>
            <tr>
                <th>PaCO₂ (mmHg)</th>
                <th>HCO₃⁻ (mEq/L)</th>
                <th>pH</th>
                <th>Classification</th>
                <th>color</th>

            </tr>
        </thead>
        <tbody>
            <!-- Table will be populated by JavaScript -->
        </tbody>
    </table>
</div>

<style>
    .table-container {
        max-height: 80vh;
        overflow-y: auto;
        margin: 20px 0;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    
    #abg-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    #abg-table th, #abg-table td {
        padding: 8px 12px;
        border: 1px solid #ddd;
        text-align: center;
    }
    
    #abg-table th {
        background-color: #f5f5f5;
        position: sticky;
        top: 0;
    }
    
    #abg-table tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    #abg-table tr:hover {
        background-color: #f0f0f0;
    }
</style>

<script>
    function calculatePH(paco2, hco3) {
        const pK = 6.1;
        const PCO2_conversion = 0.03;
        return pK + Math.log10(hco3 / (PCO2_conversion * paco2));
    }

    function classifyABG(pH, PaCO2, HCO3) {
        // Define the normal ranges
        const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
        const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
        const normalPH = pH >= 7.35 && pH <= 7.45;

        // Acidosis conditions (pH < 7.35)
        if (pH < 7.35) {
            if (PaCO2 > 45) {
                if (HCO3 < 22) {
                    return ["Mixed Acidosis", 'red'];
                } else if (HCO3 > 26) {
                    return ["Partially Compensated Respiratory Acidosis", 'orange'];
                } else {
                    return ["Uncompensated Respiratory Acidosis", 'darkorange'];
                }
            } else if (HCO3 < 22) {
                if (PaCO2 < 35) {
                    return ["Partially Compensated Metabolic Acidosis", 'yellow'];
                } else if (normalPaCO2) {
                    return ["Uncompensated Metabolic Acidosis", 'gold'];
                } else {
                    return ["Undefined Acidosis", 'gray'];
                }
            } else {
                return ["Undefined Acidosis", 'lightgray'];
            }
        }
        // Alkalosis conditions (pH > 7.45)
        else if (pH > 7.45) {
            if (PaCO2 < 35) {
                if (HCO3 < 22) {
                    return ["Partially Compensated Respiratory Alkalosis", 'lightblue'];
                } else if (HCO3 > 26) {
                    return ["Mixed Alkalosis", 'purple'];
                } else {
                    return ["Uncompensated Respiratory Alkalosis", 'blue'];
                }
            } else if (HCO3 > 26) {
                if (PaCO2 > 45) {
                    return ["Partially Compensated Metabolic Alkalosis", 'cyan'];
                } else if (normalPaCO2) {
                    return ["Uncompensated Metabolic Alkalosis", 'deepskyblue'];
                } else {
                    return ["Undefined Alkalosis", 'gray'];
                }
            } else {
                return ["Undefined Alkalosis", 'lightgray'];
            }
        }
        // Normal pH range (7.35-7.45)
        else {
            // Fully compensated conditions
            if (pH >= 7.35 && pH <= 7.399) {
                if (PaCO2 > 45 && HCO3 > 26) {
                    return ["Fully Compensated Respiratory Acidosis", 'darkgreen'];
                } else if (PaCO2 < 35 && HCO3 < 22) {
                    return ["Fully Compensated Metabolic Acidosis", 'limegreen'];
                }
            } else if (pH >= 7.401 && pH <= 7.45) {
                if (PaCO2 > 45 && HCO3 > 26) {
                    return ["Fully Compensated Metabolic Alkalosis", 'mediumseagreen'];
                } else if (PaCO2 < 35 && HCO3 < 22) {
                    return ["Fully Compensated Respiratory Alkalosis", 'springgreen'];
                }
            }
            
            // Normal condition
            if (normalPaCO2 && normalHCO3) {
                return ["Normal", 'green'];
            }
            
            return ["Undefined", 'gray'];
        }
    }

    // Generate the table
    document.addEventListener('DOMContentLoaded', function() {
        const tableBody = document.querySelector('#abg-table tbody');
        const paco2Step = 5;  // Step size for PaCO₂ to make table manageable
        const hco3Step = 1;    // Step size for HCO₃⁻
        
        // Clear any existing rows
        tableBody.innerHTML = '';
        
        // Generate rows for the table
        for (let paco2 = 10; paco2 <= 100; paco2 += paco2Step) {
            for (let hco3 = 5; hco3 <= 50; hco3 += hco3Step) {
                const pH = calculatePH(paco2, hco3);
                const [classification, color] = classifyABG(pH, paco2, hco3);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${paco2}</td>
                    <td>${hco3}</td>
                    <td>${pH.toFixed(2)}</td>
                    <td style="color: ${color}">${classification}</td>
                `;
                
                tableBody.appendChild(row);
            }
        }
    });
</script>
