package main

import (
	"log"

	"github.com/AAA-Intelligence/eve/db"
	"github.com/AAA-Intelligence/eve/manager"
)

func main() {
	config := loadConfig()
	err := db.Connect("eve.sqlite")
	if err != nil {
		log.Fatal(err)
		return
	}
	manager.StartWebServer(config.Host, config.HTTP)
}