@echo on
call "C:\Users\Shardul\anaconda3\Scripts\activate.bat" base  
cd "C:\Users\Shardul\OneDrive - London Business School\coding\anya\script"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "1_ppie-preliminary-data-analysis_ethnic.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "2_ppie-preliminary-data-analysis_imd.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "3_ppie-preliminary-data-analysis_age_under_25.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "4_ppie-preliminary-data-analysis_premature_birth.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "5_ppie-preliminary-data-analysis_is_partner.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "6_ppie-preliminary-data-analysis_non_native_english_speaker.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "7_ppie-preliminary-data-analysis_comorbidity_obesity.ipynb"
