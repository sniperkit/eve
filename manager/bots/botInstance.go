package bots

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os/exec"
	"time"
)

// a instance of the python script
type botInstance struct {
	cmd      *exec.Cmd
	writer   io.WriteCloser
	reader   *bufio.Reader
	lastUsed time.Time
}

// MessageData is used so send all needed information to the bot instance
type MessageData struct {
	Text         string  `json:"text"`
	Mood         float64 `json:"mood"`
	Affection    float64 `json:"affection"`
	Gender       int     `json:"bot_gender"`
	Name         string  `json:"bot_name"`
	PreviousText string  `json:"previous_text"`
}

// BotAnswer is the answer returned by the bot instance
type BotAnswer struct {
	Text      string  `json:"text"`
	Mood      float64 `json:"mood"`
	Affection float64 `json:"affection"`
}

func (b *botInstance) sendRequest(data MessageData) *BotAnswer {
	b.lastUsed = time.Now()
	writer := b.writer
	serialized, err := json.Marshal(data)
	_, err = fmt.Fprintln(writer, string(serialized))
	if err != nil {
		log.Println("error writing to bot pipt:", err)
		return errorBotAnswer(data.Mood, data.Affection)
	}
	response, _, err := b.reader.ReadLine()
	if err != nil {
		log.Println("error reading from pipe:", err)
		return errorBotAnswer(data.Mood, data.Affection)
	}
	msg := &BotAnswer{}
	err = json.Unmarshal(response, msg)
	if err != nil {
		if string(response) == "error" {
			// bot instance returns "error" if the request could not be processed
			log.Println("an error in the bot instance occurred")
		} else {
			fmt.Println(string(response))
			log.Println("error reading response:", err)
		}
		return errorBotAnswer(data.Mood, data.Affection)
	}
	return msg
}

// creates new instance of python script that handles message requests
func newBotInstance() (*botInstance, error) {
	cmd := exec.Command("python", "-m", "bot")

	writer, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal("error creating stdin pipe:", err)
	}
	reader, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatal("error creating stdout pipe:", err)
	}

	if err = cmd.Start(); err != nil {
		return nil, err
	}
	return &botInstance{
		cmd:    cmd,
		writer: writer,
		reader: bufio.NewReader(reader),
	}, nil
}

func errorBotAnswer(mood, affection float64) *BotAnswer {
	return &BotAnswer{
		Text:      "Ok",
		Mood:      mood,
		Affection: affection,
	}
}

// Close closes the pipe to the python script and thereby the process is stoped
func (b *botInstance) Close() {
	b.writer.Close()
	//TODOn kill process if it does not stop afer one second
}