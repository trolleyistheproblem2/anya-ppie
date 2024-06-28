@echo on
call "C:\Users\Shardul\anaconda3\Scripts\activate.bat" base  
cd "C:\Users\Shardul\OneDrive - London Business School\coding\anya\script"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "8_ppie-data-analysis_anya_users.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "9_ppie-data-analysis_free_text_analysis.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "1_ppie-data-analysis_ethnic.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "2_ppie-data-analysis_imd.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "3_ppie-data-analysis_age_under_25.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "4_ppie-data-analysis_premature_birth.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "5_ppie-data-analysis_is_partner.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "6_ppie-data-analysis_non_native_english_speaker.ipynb"
jupyter nbconvert --to webpdf --no-input --allow-chromium-download --output-dir "C:\Users\Shardul\OneDrive - London Business School\coding\anya\output" "7_ppie-data-analysis_comorbidity_obesity.ipynb"



