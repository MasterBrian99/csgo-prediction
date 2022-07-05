from selenium import webdriver
driver = webdriver.Chrome("./chrome/chromedriver")

url = 'https://www.hltv.org/matches'
driver.get(url)