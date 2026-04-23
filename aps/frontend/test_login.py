import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

print('starting')
options = Options()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
driver.get('http://localhost:5173/login')
time.sleep(2)

email_input = driver.find_element(By.ID, 'email')
pass_input = driver.find_element(By.ID, 'password')

email_input.send_keys('admin@aps.com')
pass_input.send_keys('admin_pass')

print('filling complete')
driver.find_element(By.CSS_SELECTOR, 'button[type=\"submit\"]').click()

time.sleep(2)
print('Current URL:', driver.current_url)

if driver.current_url.endswith('/login'):
    print('Still on login page. Fields:')
    print(driver.find_element(By.ID, 'email').get_attribute('value'))
    print(driver.find_element(By.ID, 'password').get_attribute('value'))

driver.quit()
