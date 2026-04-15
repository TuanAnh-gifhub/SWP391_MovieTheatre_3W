package movie.swp391.serviceImp;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PayPalServiceImpl {

    private final APIContext apiContext;

    public PayPalServiceImpl(
        @Value("${paypal.client.id}") String clientId,
        @Value("${paypal.client.secret}") String clientSecret,
        @Value("${paypal.mode}") String mode
    ) throws PayPalRESTException {
        this.apiContext = new APIContext(clientId, clientSecret, mode);
    }

    public String createPaymentUrl(Double amount, String currency, String description, String cancelUrl, String successUrl) throws PayPalRESTException {
        Amount amt = new Amount();
        amt.setCurrency(currency);
        amt.setTotal(String.format("%.2f", amount));

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amt);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);

        // Lấy approval_url để redirect user
        for (Links link : createdPayment.getLinks()) {
            if (link.getRel().equalsIgnoreCase("approval_url")) {
                return link.getHref();
            }
        }
        throw new RuntimeException("Không lấy được approval_url từ PayPal");
    }

    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);
        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);
        return payment.execute(apiContext, paymentExecution);
    }
}