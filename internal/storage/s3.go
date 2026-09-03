package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func NewS3Client(ctx context.Context, region string) (*s3.Client, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}
	return s3.NewFromConfig(cfg), nil
}

func NewPresignClient(client *s3.Client) *s3.PresignClient {
	return s3.NewPresignClient(client)
}

// PresignPutObject returns a short-lived URL the client can PUT the photo
// bytes to directly, bypassing our server for the upload itself.
func PresignPutObject(ctx context.Context, presigner *s3.PresignClient, bucket, key, contentType string, expires time.Duration) (string, error) {
	req, err := presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", fmt.Errorf("unable to presign upload url: %w", err)
	}
	return req.URL, nil
}

// PresignGetObject returns a short-lived URL for viewing a private object.
func PresignGetObject(ctx context.Context, presigner *s3.PresignClient, bucket, key string, expires time.Duration) (string, error) {
	req, err := presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", fmt.Errorf("unable to presign view url: %w", err)
	}
	return req.URL, nil
}

// PublicObjectURL builds the permanent (non-expiring) URL for an object,
// for use when the bucket serves photos with public-read access.
func PublicObjectURL(bucket, region, key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key)
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
