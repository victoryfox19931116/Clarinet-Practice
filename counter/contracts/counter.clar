
;; title: counter
;; version:
;; summary:
;; description: My First Clarity Smart Contract

;; traits
;;

;; token definitions
;; 

;; constants
;;

;; data vars
;;

;; data maps
;;
(define-map counters principal uint)

;; public functions
;;
(define-public (count-up) 
    (begin 
        (ok (map-set counters tx-sender (+ (get-count tx-sender) u1)))
    )
)

;; read only functions
;;
(define-read-only (get-count (who principal)) 
    (default-to u0 (map-get? counters who))
)

;; private functions
;;

