package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func NewS3Client(ctx context.Context, region string) (*s3.Client, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}
	return s3.NewFromConfig(cfg), nil
}

func UploadPhoto(ctx context.Context, client *s3.Client, bucket, key, contentType string, body io.Reader) (string, error) {
	uploader := manager.NewUploader(client)
	_, err := uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("unable to upload photo to s3: %w", err)
	}

	url := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", bucket, key)
	return url, nil
}

func DeleteObject(ctx context.Context, client *s3.Client, bucket, key string) error {
	_, err := client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("unable to delete photo from s3: %w", err)
	}
	return nil
}
