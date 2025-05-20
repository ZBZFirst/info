use wasm_bindgen::prelude::*;
use std::cmp::Ordering;

#[wasm_bindgen]
pub struct ProcessedData {
    fio2: Vec<f32>,
    map: Vec<f32>,
    pao2: Vec<f32>,
    oi: Vec<f32>,
    texts: Vec<String>,
}

#[wasm_bindgen]
impl ProcessedData {
    pub fn fio2(&self) -> Vec<f32> { self.fio2.clone() }
    pub fn map(&self) -> Vec<f32> { self.map.clone() }
    pub fn pao2(&self) -> Vec<f32> { self.pao2.clone() }
    pub fn oi(&self) -> Vec<f32> { self.oi.clone() }
    pub fn texts(&self) -> Vec<String> { self.texts.clone() }
}

#[wasm_bindgen]
pub fn process_csv(csv_data: &str) -> ProcessedData {
    let mut reader = csv::Reader::from_reader(csv_data.as_bytes());
    
    let mut fio2 = Vec::new();
    let mut map = Vec::new();
    let mut pao2 = Vec::new();
    let mut oi = Vec::new();
    let mut texts = Vec::new();

    for result in reader.records() {
        if let Ok(record) = result {
            if let (Some(f), Some(m), Some(p), Some(o)) = (
                record.get(0), record.get(1), record.get(2), record.get(3)
            {
                if let (Ok(f_val), Ok(m_val), Ok(p_val), Ok(o_val)) = (
                    f.parse::<f32>(), m.parse::<f32>(), 
                    p.parse::<f32>(), o.parse::<f32>())
                {
                    fio2.push(f_val);
                    map.push(m_val);
                    pao2.push(p_val);
                    oi.push(o_val);
                    texts.push(format!(
                        "FiO₂: {:.2}<br>MAP: {:.1} cmH₂O<br>PaO₂: {:.1} mmHg<br>OI: {:.1}",
                        f_val, m_val, p_val, o_val
                    ));
                }
            }
        }
    }

    ProcessedData { fio2, map, pao2, oi, texts }
}
