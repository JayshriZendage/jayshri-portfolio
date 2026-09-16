import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar/navbar';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('jayshri-portfolio');

  countdown = 0;
  isSending = false;
  isSuccess = false;
  isError = false;

  // Inject FormBuilder
  private fb = inject(FormBuilder);

  // Contact Form
  contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  async onSubmit(): Promise<void> {

    this.isSuccess = false;
    this.isError = false;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSending = true;
    this.countdown = 5;

    const countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      }
    }, 1000);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('EMAIL_TIMEOUT'));
      }, 5000);
    });

    try {

      const formData = this.contactForm.getRawValue();

      const emailPromise = emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        },
        {
          publicKey: 'YOUR_PUBLIC_KEY'
        }
      );

      await Promise.race([
        emailPromise,
        timeoutPromise
      ]);

      this.isSuccess = true;
      this.contactForm.reset();

    } catch (error) {

      console.error('Email sending failed:', error);

      this.isError = true;

    } finally {

      clearInterval(countdownInterval);

      this.isSending = false;
      this.countdown = 0;

    }
  }
}