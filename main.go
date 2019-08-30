package main

import "fmt"
import "github.com/think-free/tesgo/tesgo/teslapi"

func main(){

	fmt.Println("Hello")
	api := teslapi.New("", "", "", "", 1, 30)
	api.Run()
}