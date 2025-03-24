import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  components: {
    Table: {
      variants: {
        simple: {
          th: {
            borderBottom: '1px',
            borderColor: 'gray.200',
            textTransform: 'none',
          },
          td: {
            borderBottom: '1px',
            borderColor: 'gray.200',
          },
        },
      },
    },
  },
})

export default theme