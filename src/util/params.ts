import fs from 'fs'
	
const filePath = './param.json'

// index 0 : scorefarming fr server
// index 1 : full streak gang server
// index 2 : Fayar test server

export function getParam() {
	return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function saveParam(param: any) {
    fs.writeFileSync(filePath, JSON.stringify(param, null, 4), 'utf-8')
}