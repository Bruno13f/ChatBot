package main

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

var db *sql.DB

func main() {
	godotenv.Load()
	dbURL := os.Getenv("TursoDatabaseURL")
	dbToken := os.Getenv("TursoDatabaseToken")
	etlURL := os.Getenv("ETL_APIURL")
	dataGathererURL := os.Getenv("DATAGATHERER_APIURL")

	fullURL := dbURL + "?authToken=" + dbToken
	log.Printf("Connecting to database at %s\n", fullURL)

	var err error
	db, err = sql.Open("libsql", fullURL)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	etlTarget, err := url.Parse(etlURL)
	if err != nil {
		log.Fatalf("Failed to parse ETL URL: %v", err)
	}
	etlProxy := httputil.NewSingleHostReverseProxy(etlTarget)

	// Set up data gatherer proxy for keywords
	dataGathererTarget, err := url.Parse(dataGathererURL)
	if err != nil {
		log.Fatalf("Failed to parse Data Gatherer URL: %v", err)
	}
	dataGathererProxy := httputil.NewSingleHostReverseProxy(dataGathererTarget)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.GET("/metadata", MetadataHandler)
	r.GET("/resources", func(c *gin.Context) {

		c.Request.URL.Path = "/resources"
		etlProxy.ServeHTTP(c.Writer, c.Request)

	})
	r.Any("/etl/*proxyPath", func(c *gin.Context) {
		c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/etl")

		etlProxy.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	})

	r.GET("/keywords", func(c *gin.Context) {
		c.Request.URL.Path = "/keywords"
		dataGathererProxy.ServeHTTP(c.Writer, c.Request)
	})

	r.POST("/keywords", func(c *gin.Context) {
		c.Request.URL.Path = "/keywords"
		dataGathererProxy.ServeHTTP(c.Writer, c.Request)
	})

	r.DELETE("/keywords/:id", func(c *gin.Context) {
		id := c.Param("id")
		c.Request.URL.Path = "/keywords/" + id
		dataGathererProxy.ServeHTTP(c.Writer, c.Request)
	})

	r.Run(":10002")
}

func MetadataHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"component": "API Gateway"})
}
