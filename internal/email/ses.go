package email

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

func NewSESClient(ctx context.Context, region string) (*sesv2.Client, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}
	return sesv2.NewFromConfig(cfg), nil
}

func SendVerificationEmail(ctx context.Context, client *sesv2.Client, from, to, token, publicBaseURL string) error {
	verifyLink := fmt.Sprintf("%s/auth/verify-email?token=%s", publicBaseURL, token)

	subject := "Verify your email"
	body := fmt.Sprintf("Welcome! Please verify your email by visiting the link below:\n\n%s\n\nThis link expires in 24 hours.", verifyLink)

	_, err := client.SendEmail(ctx, &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(from),
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{Data: aws.String(subject)},
				Body: &types.Body{
					Text: &types.Content{Data: aws.String(body)},
				},
			},
		},
	})
	if err != nil {
		return fmt.Errorf("unable to send verification email: %w", err)
	}
	return nil
}
