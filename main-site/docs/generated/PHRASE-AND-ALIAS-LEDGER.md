# Phrase and Alias Ledger

The current matcher stores most lexical material in a legacy `phrases` array, so aliases, abbreviations and spelling variants are not yet fully typed. Explicit entries (currently including the observed ecommerce misspelling) are distinguished below. A crawler may propose classifications but cannot approve them.

| Phrase | Concept | Lexical relationship | Provenance | Traversal | Review |
| --- | --- | --- | --- | --- | --- |
| access control | access-control | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| accessibility | accessibility | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| accessible | accessibility | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| analytics system | analytics-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| api | software-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| application | software-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| archive and access | media-archive-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| audio | audio-medium | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| audio engineer | audio-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| audio engineering | audio-engineering | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| audio installation | physical-audio-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| audio production | audio-production | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| audio routed to transmission | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| audio routing | signal-flow-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| audio system | physical-audio-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| authentication | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| authorisation | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| authorization | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| backend | software-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| backup communications path | fallback-signal-path | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| backup communications paths | fallback-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| backup path | fallback-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| backup signal route | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| brand | identity-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| brand system | identity-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| broadcast audio | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| broadcast channel | live-broadcast | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| broadcast feed | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| broadcast infrastructure | broadcast-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| broadcast system | broadcast-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| broadcast-audio | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| build | build-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| building | build-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| catalog interface | product-catalogue | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| catalogue interface | product-catalogue | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| checkout | checkout-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| checkout system | checkout-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| ci/cd | cloud-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| cloud | cloud-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| cloud server | cloud-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| code | software-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| commissioning | testing-commissioning | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| comms | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| comms network | communications-networking | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| communication system | communications-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| communications network | communications-networking | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| communications redundancy | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| communications system | communications-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| community membership | community-membership-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| community platform | community-platform | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| community publishing | community-publishing-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| community resources | community-resource-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| community service | community-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| configuration | configure-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| configure | configure-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| connected media control | media-control-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| content archive system | content-archive-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| content delivery | media-distribution | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| content system | content-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| create | build-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| data model | data-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| data system | data-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| database | data-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| deploy | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| deployment | cloud-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| design | design-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| designer | designer-role | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| designing | design-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| device product | hardware-product | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| digital platform | digital-platform | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| digital storefront | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| e-commerce | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| e-commerce site | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| eccomerce | ecommerce-storefront | MISSPELLING_OF | explicit lexical metadata | direct lexical resolution | reviewed structure; semantic meaning still reviewable |
| ecommerce | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| ecommerce site | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| editorial content system | editorial-content-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| electronics | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| embedded | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| embedded product | hardware-product | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| engineer | engineer-role | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| engineering | engineer-role | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| equipment rack | server-rack | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| fail-safe | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| failover | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| fallback path | fallback-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| fallback signal path | fallback-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| feed into broadcast | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| field | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| field comms | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| field communications | field-communications | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| field operations | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| field recording | field-recording | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| firmware | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| fit | install-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| fix | repair-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| football game | live-sport | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| from image | source-image | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| frontend | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| go live | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| handover | technical-handover | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| hardware | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| hardware product | hardware-product | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| hardware software integration | systems-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| high availability | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| hosting | cloud-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| identity | identity-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| iem | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| in ear monitoring | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| in production | operational-state | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| in-ear monitoring | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| inclusive | accessibility | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| information system | data-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| install | install-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| installation | install-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| interactive installation | interactive-media-installation | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| interactive media installation | interactive-media-installation | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| interface | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| knowledge system | knowledge-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| launch | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live | operational-state | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live broadcast | live-broadcast | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| live event environment | live-environment | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live field | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live operation | live-operational-support | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live production environment | live-environment | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live sport | live-sport | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| live sporting event | live-sport | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live sports | live-sport | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| live support | live-operational-support | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| location recording | field-recording | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| login | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| logo | logo-artwork | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| logo artwork | logo-artwork | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| logo design | logo-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| logo designer | logo-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| loudspeaker | physical-audio-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| maintain | operate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| maintenance | operate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| make | make-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| mark artwork | logo-artwork | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| match | live-sport | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media archive | media-archive-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media archive platform | media-archive-platform | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| media control system | media-control-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media distribution | media-distribution | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| media distribution system | media-distribution-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| media playback installation | physical-playback-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media production system | media-production-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| media streaming | streaming-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media system | media-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| media systems | media-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| media-control system | media-control-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| migrate | migrate-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| migration | migrate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| mixing | audio-production | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| mixing desk | physical-audio-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| multi-format publishing | multiformat-publishing-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| multiformat publishing | multiformat-publishing-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| multimedia distribution | media-distribution-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| multimedia system | media-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| multimedia systems | media-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| music | music-domain | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| musical | music-domain | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| networked communications | communications-networking | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| nfl | live-sport | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| ob | live-broadcast | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| on-site operation | live-operational-support | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| online platform | digital-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| online shop | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| online storefront | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| operate | operate-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| operating documentation | technical-handover | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| operation | operate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| operational | operational-state | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| operational data system | operational-data-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| operational support | live-operational-support | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| organisational identity | organisational-identity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| organization identity | organisational-identity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| outside broadcast | live-broadcast | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| payment checkout | checkout-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pcb | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| permission enforcement | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| permissions | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| physical media playback installation | physical-playback-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| physical playback | physical-playback-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| physical server | physical-server | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| pitch communications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pitch-side | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pitch-side communications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pitch-side telecom | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pitchside communications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| pitchside telecom | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| playback system | physical-playback-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| playout | media-distribution | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| portal | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary and backup | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary and fallback | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary communications path | primary-signal-path | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| primary communications paths | primary-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary path | primary-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary route | primary-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| primary signal path | primary-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| product catalog | product-catalogue | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| product catalogue | product-catalogue | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| product definition | product-definition | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| product family identity | product-identity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| product identity | product-identity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| production workflow | media-production-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| program audio | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| program-audio | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| programme audio | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| programme-audio | programme-audio-feed | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| programme-audio feed | programme-audio-feed | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| protected | security | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| publish | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| publishing | media-distribution | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| publishing system | content-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| purchase flow | checkout-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| put into production | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| rack installation | server-rack | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| radio broadcast | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| rebuild | recreate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| recording | audio-production | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| recreate | recreate-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| redraw | recreate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| redundancy | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| reference image | source-image | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| reliability | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| reliable | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| repair | repair-activity | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| requirements | product-definition | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| resilience | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| resilient | reliability-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| resilient comms | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| resilient signal paths | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| restore | repair-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| role permissions | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| role-based access | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| routed to transmission | broadcast-audio-delivery | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| routing | signal-flow-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| run | operate-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| scalability | scalability | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| scalable | scalability | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| scale up | scalability | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| secondary route | fallback-signal-path | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| secure | security | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| secure zones | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| security | security | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| security boundary | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sensor | electronics-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| server | server-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| server hardware | physical-server | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| server rack | server-rack | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| server software | server-software | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| server system | server-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| service architecture | product-definition | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| service backend | server-software | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| set up | configure-activity | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sideline | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sideline communications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| signal flow | signal-flow-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| signal redundancy | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| signal routing | signal-flow-design | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| software | software-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sound | audio-medium | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sound design | audio-production | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sound engineer | audio-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sound engineering | audio-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sound system | physical-audio-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| source image | source-image | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| sport broadcast | live-broadcast | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| sports broadcast | live-broadcast | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| stadium | live-field-operations | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| staff portal | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| streaming backend | streaming-platform | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| streaming platform | streaming-platform | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| studio | studio-environment | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| studio engineer | studio-engineering | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| studio engineering | studio-engineering | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| system definition | product-definition | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| system integration | systems-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| system test | testing-commissioning | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| systems integration | systems-integration | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| take live | transition-to-live | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| technical documentation | technical-handover | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| technical integration | systems-integration | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| tele communications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| telecom network | communications-networking | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| telecom redundancy | signal-path-resilience | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| telecommunications | field-communications | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| testing | testing-commissioning | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| user accounts | access-control | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| validation | testing-commissioning | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| visual language | identity-systems | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| visual language system | visual-language-system | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| visual-language system | visual-language-system | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| web app | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| web application | web-application | CANONICAL_LABEL | legacy phrases array | direct lexical resolution | review-required |
| web presence | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| web shop | ecommerce-storefront | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
| website | web-application | ALIAS_OF (legacy/unclassified) | legacy phrases array | direct lexical resolution | review-required |
