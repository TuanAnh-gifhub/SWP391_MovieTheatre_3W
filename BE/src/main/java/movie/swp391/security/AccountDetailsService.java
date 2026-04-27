package movie.swp391.security;

import lombok.RequiredArgsConstructor;
import movie.swp391.repository.AccountRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return accountRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
